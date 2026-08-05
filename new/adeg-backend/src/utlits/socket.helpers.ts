import { ObjectId, ServerMonitoringMode } from "mongodb";

import { redisSocketService } from "./socket.redis";
import { activeUsers, chatRooms } from "../socket";
import {
  messagePersistenceQueue,
  redis,
  refundMessagePersistenceQueue,
  ticketMessagePersistenceQueue,
} from "../helpers/redis";
import WebSocket from "ws";
import { chatService } from "../app/modules/chat/chat.service";
import prisma from "../shared/prisma";
import {
  ConversationStatus,
  MessageType,
  PrivateMessage,
} from "@prisma/client";
import { notificationServices } from "../app/modules/notifications/notification.service";
import { constructFromSymbol } from "date-fns/constants";
interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  user2Id?: string;
  chatroomId?: string;
  type: string;
  groupId?: string;
}

export enum MessageTypes {
  JOIN_PRIVATE_CHAT = "joinPrivateChat",
  SEND_PRIVATE_MESSAGE = "sendPrivateMessage",
  RECEIVED_PRIVATE_MESSAGE = "receivePrivateMessage",
  CONVERSATION_LIST = "conversationList",
  TICKET_LIST = "ticketList",
  REFUND_LIST = "refundList",
  JOIN_CONVERSATION_LIST = "joinConversationList",
  AUTH_SUCCESS = "authSuccess",
  AUTH_FAILURE = "authFailure",
  FAILURE = "Failure",
  JOIN_APP = "joinApp",
  JOIN_GROUP = "joinGroup",
  SEND_GROUP_MESSAGE = "sendGroupMessage",
  RECEIVED_GROUP_MESSAGE = "receiveGroupMessage",

  // new ticket/refund flows
  JOIN_TICKET_CHAT = "joinTicketChat",
  SEND_TICKET_MESSAGE = "sendTicketMessage",
  RECEIVED_TICKET_MESSAGE = "receiveTicketMessage",

  JOIN_REFUND_CHAT = "joinRefundChat",
  SEND_REFUND_MESSAGE = "sendRefundMessage",
  RECEIVED_REFUND_MESSAGE = "receiveRefundMessage",
}

const MAX_REDIS_MESSAGES = 5;

function broadcastToGroup(
  groupId: string,
  message: any,
  groupRooms: Map<string, Set<ExtendedWebSocket>>,
) {
  const groupClients = groupRooms.get(groupId);
  if (!groupClients) return;

  groupClients.forEach((client: ExtendedWebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

export const handleConversationJoinEvent = async (
  ws: ExtendedWebSocket,
  userId: string,
  activeUsers: Map<
    string,
    { socket: ExtendedWebSocket; lastActiveAt: Date | null }
  >,
) => {
  ws.userId = userId;
  activeUsers.set(userId, { socket: ws, lastActiveAt: new Date() });
  ws.send(
    JSON.stringify({
      type: MessageTypes.JOIN_CONVERSATION_LIST,
      message: `Successfully joined`,
    }),
  );
};

async function storeAndSendPrivateMessage(
  ws: ExtendedWebSocket,
  senderId: string,
  receiverId: string,
  content: any,
  imageUrl: string,
  conversationId: string,
  chatType?: MessageType,
  offerId?: string,
) {
  try {
    const timestamp = new Date().toISOString();

    const [senderDetails, receiverDetails] = await Promise.all([
      redisSocketService.getUserDetails(senderId),
      redisSocketService.getUserDetails(receiverId),
    ]);

    const messagePayload = {
      id: new ObjectId().toString(),
      senderId,
      receiverId,
      content,
      offerId,
      imageUrl,
      createdAt: timestamp,
      read: false,
      updatedAt: timestamp,
      chatType: chatType || "PRIVATEMESSAGE",
    };

    const chatRoom = chatRooms.get(conversationId);

    if (chatRoom) {
      for (const clientSocket of chatRoom) {
        if (clientSocket.readyState === clientSocket.OPEN) {
          const isSender = clientSocket.userId === senderId;
          clientSocket.send(
            JSON.stringify({
              ...messagePayload,
              conversationId,
              type: MessageTypes.RECEIVED_PRIVATE_MESSAGE,
              receiver: isSender ? receiverDetails : senderDetails,
            }),
          );
        }
      }
    }

    const redisKey = `chat:messages:${conversationId}`;
    const messageObject = { ...messagePayload, conversationId };

    const keyType = await redis.type(redisKey);
    if (keyType !== "zset" && keyType !== "none") {
      await redis.del(redisKey);
    }

    await redis.zadd(
      redisKey,
      new Date(timestamp).getTime(),
      JSON.stringify(messageObject),
    );

    const isReceiverInRoom =
      chatRoom &&
      [...chatRoom].some((clientSocket) => clientSocket.userId === receiverId);

    if (!isReceiverInRoom) {
      await redis.hincrby(
        `conversation:unseen:${conversationId}`,
        receiverId,
        1,
      );
    }

    const conversationPreview =
      typeof content === "string"
        ? content
        : chatType === MessageType.OFFER
          ? "B2B Offer"
          : imageUrl
            ? "📷 Image"
            : "Message";

    await redisSocketService.updateConversationList(
      "conversation",
      senderId,
      receiverId,
      conversationId,
      conversationPreview,
    );

    const [senderConversationList, receiverConversationList] =
      await Promise.all([
        redisSocketService.getConversationListFromRedis(
          "conversation",
          senderId,
          1,
          10,
        ),
        redisSocketService.getConversationListFromRedis(
          "conversation",
          receiverId,
          1,
          10,
        ),
      ]);

    [senderId, receiverId].forEach((userId) => {
      const socket = activeUsers.get(userId);
      if (socket && socket.readyState === socket.OPEN) {
        socket.send(
          JSON.stringify({
            type: MessageTypes.CONVERSATION_LIST,
            result:
              userId === senderId
                ? senderConversationList
                : receiverConversationList,
          }),
        );
      }
    });

    setImmediate(async () => {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: conversationPreview,
          status: ConversationStatus.ACTIVE,
        },
      });
      const isReceiverConnected =
        activeUsers.has(receiverId) &&
        activeUsers.get(receiverId)?.readyState === WebSocket.OPEN;

      if (!isReceiverConnected) {
        await notificationServices.sendSingleNotification({
          id: receiverId,
          body: `${senderDetails?.username} send you a message`,
          title: senderDetails?.image,
        });
      }
      const listLength = await redis.zcard(redisKey);
      if (listLength >= MAX_REDIS_MESSAGES) {
        await messagePersistenceQueue.add(
          "messagePersistenceQueue",
          { conversationId },
          {
            jobId: `persist:${conversationId}:${Date.now()}`,
            removeOnComplete: true,
            delay: 0,
            attempts: 3,
            removeOnFail: { count: 3 },
          },
        );
      }
    });
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        type: MessageTypes.FAILURE,
        message: `Message sending failed: ${error.message || error}`,
      }),
    );
  }
}

async function storeAndSendTicketMessage(
  ws: ExtendedWebSocket,
  senderId: string,
  receiverId: string,
  content: any,
  imageUrl: string | undefined,
  ticketId: string,
) {
  try {
    const timestamp = new Date().toISOString();

    const [senderDetails, receiverDetails] = await Promise.all([
      redisSocketService.getUserDetails(senderId),
      redisSocketService.getUserDetails(receiverId),
    ]);

    const messagePayload = {
      id: new ObjectId().toString(),
      senderId,
      receiverId,
      content,
      imageUrl,
      createdAt: timestamp,
      read: false,
      updatedAt: timestamp,
      messageType: "TICKETMESSAGE",
    };

    const roomKey = `ticket:${ticketId}`;
    const chatRoom = chatRooms.get(roomKey);
    console.log(chatRoom, "check chat room ");

    if (chatRoom) {
      for (const clientSocket of chatRoom) {
        if (clientSocket.readyState === WebSocket.OPEN) {
          const isSender = clientSocket.userId === senderId;
          clientSocket.send(
            JSON.stringify({
              ...messagePayload,
              ticketId,
              type: MessageTypes.RECEIVED_TICKET_MESSAGE,
              receiver: isSender ? receiverDetails : senderDetails,
            }),
          );
        }
      }
    }

    const redisKey = `ticket:messages:${ticketId}`;
    const messageObject = { ...messagePayload, ticketId };

    const keyType = await redis.type(redisKey);
    if (keyType !== "zset" && keyType !== "none") {
      await redis.del(redisKey);
    }

    await redis.zadd(
      redisKey,
      new Date(timestamp).getTime(),
      JSON.stringify(messageObject),
    );

    const isReceiverInRoom =
      chatRoom &&
      [...chatRoom].some((clientSocket) => clientSocket.userId === receiverId);

    if (!isReceiverInRoom) {
      await redis.hincrby(`ticket:unseen:${ticketId}`, receiverId, 1);
    }

    // Update "conversation list" style data for ticket participants so front-end can show ticket lists
    await redisSocketService.updateConversationList(
      "ticket",
      senderId,
      receiverId,
      ticketId,
      content,
    );

    const [senderConversationList, receiverConversationList] =
      await Promise.all([
        redisSocketService.getConversationListFromRedis(
          "ticket",
          senderId,
          1,
          10,
        ),
        redisSocketService.getConversationListFromRedis(
          "ticket",
          receiverId,
          1,
          10,
        ),
      ]);

    [senderId, receiverId].forEach((userId) => {
      const socket = activeUsers.get(userId);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "ticketList",
            result:
              userId === senderId
                ? senderConversationList
                : receiverConversationList,
          }),
        );
      }
    });

    setImmediate(async () => {
      // await prisma.ticket.update({
      //   where: { id: ticketId },
      //   data: {
      //     updatedAt: new Date(),
      //   },
      // });

      const isReceiverConnected =
        activeUsers.has(receiverId) &&
        activeUsers.get(receiverId)?.readyState === WebSocket.OPEN;

      if (!isReceiverConnected) {
        await notificationServices.sendSingleNotification({
          id: receiverId,
          body: `${senderDetails?.username} sent you a ticket message`,
          title: senderDetails?.image,
        });
      }

      const listLength = await redis.zcard(redisKey);

      if (listLength >= MAX_REDIS_MESSAGES) {
        console.log("in list length");
        await ticketMessagePersistenceQueue.add(
          "ticketMessageQueue",
          { ticketId },
          {
            // jobId: `persist:ticket:${ticketId}:${Date.now()}`,
            jobId: `persist-ticket-${ticketId}-${Date.now()}}`,
            removeOnComplete: true,
            delay: 0,
            attempts: 3,
            removeOnFail: { count: 3 },
          },
        );
      }
    });
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        type: MessageTypes.FAILURE,
        message: `Ticket message sending failed: ${error.message || error}`,
      }),
    );
  }
}

async function storeAndSendRefundMessage(
  ws: ExtendedWebSocket,
  senderId: string,
  receiverId: string,
  content: any,
  imageUrl: string | undefined,
  refundId: string,
) {
  try {
    const timestamp = new Date().toISOString();

    const [senderDetails, receiverDetails] = await Promise.all([
      redisSocketService.getUserDetails(senderId),
      redisSocketService.getUserDetails(receiverId),
    ]);

    const messagePayload = {
      id: new ObjectId().toString(),
      senderId,
      receiverId,
      content,
      imageUrl,
      createdAt: timestamp,
      read: false,
      updatedAt: timestamp,
      messageType: "REFUNDMESSAGE",
    };

    const roomKey = `refund:${refundId}`;
    const chatRoom = chatRooms.get(roomKey);

    if (chatRoom) {
      for (const clientSocket of chatRoom) {
        if (clientSocket.readyState === WebSocket.OPEN) {
          const isSender = clientSocket.userId === senderId;
          clientSocket.send(
            JSON.stringify({
              ...messagePayload,
              refundId,
              type: MessageTypes.RECEIVED_REFUND_MESSAGE,
              receiver: isSender ? receiverDetails : senderDetails,
            }),
          );
        }
      }
    }

    const redisKey = `refund:messages:${refundId}`;
    const messageObject = { ...messagePayload, refundId };

    const keyType = await redis.type(redisKey);
    if (keyType !== "zset" && keyType !== "none") {
      await redis.del(redisKey);
    }

    await redis.zadd(
      redisKey,
      new Date(timestamp).getTime(),
      JSON.stringify(messageObject),
    );

    const isReceiverInRoom =
      chatRoom &&
      [...chatRoom].some((clientSocket) => clientSocket.userId === receiverId);

    if (!isReceiverInRoom) {
      await redis.hincrby(`refund:unseen:${refundId}`, receiverId, 1);
    }

    await redisSocketService.updateConversationList(
      "refund",
      senderId,
      receiverId,
      refundId,
      content,
    );

    const [senderConversationList, receiverConversationList] =
      await Promise.all([
        redisSocketService.getConversationListFromRedis(
          "refund",
          senderId,
          1,
          10,
        ),
        redisSocketService.getConversationListFromRedis(
          "refund",
          receiverId,
          1,
          10,
        ),
      ]);

    [senderId, receiverId].forEach((userId) => {
      const socket = activeUsers.get(userId);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "refundList",
            result:
              userId === senderId
                ? senderConversationList
                : receiverConversationList,
          }),
        );
      }
    });

    setImmediate(async () => {
      // await prisma.refund.update({
      //   where: { id: refundId },
      //   data: {
      //     updatedAt: new Date(),
      //   },
      // });

      const isReceiverConnected =
        activeUsers.has(receiverId) &&
        activeUsers.get(receiverId)?.readyState === WebSocket.OPEN;

      if (!isReceiverConnected) {
        await notificationServices.sendSingleNotification({
          id: receiverId,
          body: `${senderDetails?.username} sent you a refund message`,
          title: senderDetails?.image,
        });
      }

      const listLength = await redis.zcard(redisKey);
      if (listLength >= MAX_REDIS_MESSAGES) {
        await refundMessagePersistenceQueue.add(
          "refundMessageQueue",
          { refundId },
          {
            jobId: `persist:refund:${refundId}:${Date.now()}`,
            removeOnComplete: true,
            delay: 0,
            attempts: 3,
            removeOnFail: { count: 3 },
          },
        );
      }
    });
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        type: MessageTypes.FAILURE,
        message: `Refund message sending failed: ${error.message || error}`,
      }),
    );
  }
}

function handleDisconnect(ws: ExtendedWebSocket) {
  try {
    if (ws.userId) {
      activeUsers.delete(ws.userId);
      redisSocketService.removeUserConnection(ws.userId);
      if (ws.chatroomId && chatRooms.has(ws.chatroomId)) {
        const chatRoom = chatRooms.get(ws.chatroomId);
        chatRoom?.delete(ws);
        if (chatRoom && chatRoom.size === 0) {
          chatRooms.delete(ws.chatroomId);
        }
      }
    }
  } catch (error) {
    return;
  }
}

export {
  broadcastToGroup,
  ExtendedWebSocket,
  handleDisconnect,
  storeAndSendPrivateMessage,
  storeAndSendTicketMessage,
  storeAndSendRefundMessage,
};
