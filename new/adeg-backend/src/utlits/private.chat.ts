import { constructFromSymbol } from "date-fns/constants";
import { chatService } from "../app/modules/chat/chat.service";
import { redis } from "../helpers/redis";
import prisma from "../shared/prisma";
import { activeUsers, chatRooms } from "../socket";
import {
  ExtendedWebSocket,
  MessageTypes,
  storeAndSendPrivateMessage,
  storeAndSendRefundMessage,
  storeAndSendTicketMessage,
} from "./socket.helpers";
import { redisSocketService } from "./socket.redis";

export const handleJoinApp = async (
  ws: ExtendedWebSocket,
  userId: any,
  activeUsers: Map<string, ExtendedWebSocket>,
): Promise<void> => {
  ws.userId = userId;
  activeUsers.set(userId, ws);
  await redisSocketService.storeUserConnection(userId);
  ws.send(
    JSON.stringify({
      type: MessageTypes.AUTH_SUCCESS,
      message: `Successfully joined`,
    }),
  );
};

async function handleJoinPrivateChat(
  ws: ExtendedWebSocket,
  parsedData: any,
  chatRooms: Map<string, Set<ExtendedWebSocket>>,
) {
  const { userId, user2Id, chatType } = parsedData;
  for (const [roomId, sockets] of chatRooms.entries()) {
    if (sockets.has(ws)) {
      sockets.delete(ws);

      if (sockets.size === 0) {
        chatRooms.delete(roomId);
      }
    }
  }

  const findUsr = await prisma.user.findUnique({ where: { id: user2Id } });
  if (!findUsr) {
    ws.send(
      JSON.stringify({
        type: MessageTypes.AUTH_FAILURE,
        message: `User with ID ${user2Id} does not exist.`,
      }),
    );
    return;
  }

  const conversation = await chatService.createConversationIntoDB(
    userId,
    user2Id,
    chatType,
  );
  const chatroomId = conversation?.id as string;
  ws.chatroomId = chatroomId;
  ws.userId = userId;
  ws.type = chatType;
  activeUsers.set(userId, ws);
  if (!chatRooms.has(chatroomId)) {
    chatRooms.set(chatroomId, new Set());
  }

  chatRooms.get(chatroomId)?.add(ws);

  ws.send(
    JSON.stringify({
      type: MessageTypes.JOIN_PRIVATE_CHAT,
      message: `Successfully joined the private chat with user ${user2Id}`,
      chatroomId,
    }),
  );
  setImmediate(async () => {
    await prisma.privateMessage.updateMany({
      where: {
        conversationId: chatroomId,
        receiverId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
    await redis.hset(`conversation:unseen:${chatroomId}`, userId, 0);
  });
}

async function handleSendPrivateMessage(
  ws: ExtendedWebSocket,
  parsedData: any,
) {
  const { userId, receiverId, content, imageUrl, chatType } = parsedData;
  const senderSocket = activeUsers.get(userId);
  const conversationId = senderSocket?.chatroomId || ws.chatroomId;

  try {
    if (conversationId) {
      await storeAndSendPrivateMessage(
        ws,
        userId,
        receiverId,
        content,
        imageUrl,
        conversationId,
        chatType
      );
    } else {
      ws.send(
        JSON.stringify({
          type: MessageTypes.AUTH_FAILURE,
          message: "Conversation ID not found for sender.",
        }),
      );
    }
  } catch (error) {
    ws.send(
      JSON.stringify({
        type: MessageTypes.AUTH_FAILURE,
        message: `Error sending private message:, ${error}`,
      }),
    );
  }
}

async function handleJoinTicketChat(
  ws: ExtendedWebSocket,
  parsedData: any,
  chatRooms: Map<string, Set<ExtendedWebSocket>>,
) {
  const { userId, ticketId } = parsedData;
  // console.log(chatRooms.entries());
  // remove from existing room
  for (const [roomId, sockets] of chatRooms.entries()) {
    if (sockets.has(ws)) {
      sockets.delete(ws);
      if (sockets.size === 0) {
        chatRooms.delete(roomId);
      }
    }
  }

  // ensure ticket exists
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    ws.send(
      JSON.stringify({
        type: MessageTypes.AUTH_FAILURE,
        message: `Ticket with ID ${ticketId} does not exist.`,
      }),
    );
    return;
  }

  const roomKey = `ticket:${ticketId}`;
  ws.chatroomId = roomKey;
  ws.userId = userId;
  activeUsers.set(userId, ws);

  if (!chatRooms.has(roomKey)) chatRooms.set(roomKey, new Set());
  chatRooms.get(roomKey)?.add(ws);

  ws.send(
    JSON.stringify({
      type: MessageTypes.JOIN_TICKET_CHAT,
      message: `Successfully joined ticket chat ${ticketId}`,
      ticketId,
    }),
  );

  setImmediate(async () => {
    await prisma.privateMessage.updateMany({
      where: {
        ticketId: ticketId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    });
    await redis.hset(`ticket:unseen:${ticketId}`, userId, 0);
  });
}

async function handleSendTicketMessage(ws: ExtendedWebSocket, parsedData: any) {
  const { userId, receiverId, content, imageUrl, ticketId } = parsedData;
  // const roomKey = `ticket:${ticketId}`;

  try {
    await storeAndSendTicketMessage(
      ws,
      userId,
      receiverId,
      content,
      imageUrl,
      ticketId,
    );
  } catch (error) {
    ws.send(
      JSON.stringify({
        type: MessageTypes.FAILURE,
        message: `Error sending ticket message: ${error}`,
      }),
    );
  }
}

async function handleJoinRefundChat(
  ws: ExtendedWebSocket,
  parsedData: any,
  chatRooms: Map<string, Set<ExtendedWebSocket>>,
) {
  const { userId, refundId } = parsedData;

  // remove from existing room
  for (const [roomId, sockets] of chatRooms.entries()) {
    if (sockets.has(ws)) {
      sockets.delete(ws);
      if (sockets.size === 0) {
        chatRooms.delete(roomId);
      }
    }
  }

  const refund = await prisma.refund.findUnique({ where: { id: refundId } });
  if (!refund) {
    ws.send(
      JSON.stringify({
        type: MessageTypes.AUTH_FAILURE,
        message: `Refund with ID ${refundId} does not exist.`,
      }),
    );
    return;
  }

  const roomKey = `refund:${refundId}`;
  ws.chatroomId = roomKey;
  ws.userId = userId;
  activeUsers.set(userId, ws);

  if (!chatRooms.has(roomKey)) chatRooms.set(roomKey, new Set());
  chatRooms.get(roomKey)?.add(ws);

  ws.send(
    JSON.stringify({
      type: MessageTypes.JOIN_REFUND_CHAT,
      message: `Successfully joined refund chat ${refundId}`,
      refundId,
    }),
  );

  setImmediate(async () => {
    await prisma.privateMessage.updateMany({
      where: {
        refundId: refundId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    });
    await redis.hset(`refund:unseen:${refundId}`, userId, 0);
  });
}

async function handleSendRefundMessage(ws: ExtendedWebSocket, parsedData: any) {
  const { userId, receiverId, content, imageUrl, refundId } = parsedData;

  try {
    await storeAndSendRefundMessage(
      ws,
      userId,
      receiverId,
      content,
      imageUrl,
      refundId,
    );
  } catch (error) {
    ws.send(
      JSON.stringify({
        type: MessageTypes.FAILURE,
        message: `Error sending refund message: ${error}`,
      }),
    );
  }
}

export {
  handleJoinPrivateChat,
  handleSendPrivateMessage,
  handleJoinTicketChat,
  handleSendTicketMessage,
  handleJoinRefundChat,
  handleSendRefundMessage,
};
