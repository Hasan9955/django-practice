import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../shared/pagination";
import { redis } from "../../../helpers/redis";
import { MessageType, TicketStatus } from "@prisma/client";
import { activeUsers } from "../../../socket";
import { storeAndSendPrivateMessage, storeAndSendTicketMessage } from "../../../utlits/socket.helpers";
import config from "../../../config";




const createTicketIntoDB = async (payload: any, userId: string) => {

    const userInfo = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!userInfo) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const getSuperAdmin = await prisma.user.findFirst({
        where: {
            email: config.super_admin_email || "adegbuyifred@gmail.com"
        },
    });

    if (!getSuperAdmin) {
        throw new ApiError(httpStatus.NOT_FOUND, "Super admin not found");
    }

    const result = await prisma.ticket.create({
        data: {
            ...payload,
            tickerRole: userInfo.role,
            ticketCreatorId: userId,
            ticketReceiverId: getSuperAdmin?.id
        }
    });

    const ticketMessage = {
      Ticket_Name : payload.ticketName,
      Ticket_Description : payload.ticketDescription,
    }
    const ws = activeUsers.get(getSuperAdmin?.id);

    if(ws) {
      storeAndSendTicketMessage(ws, userId, getSuperAdmin.id, JSON.stringify(ticketMessage),"", result.id);
    }
    return result;
}


const getAllTicketConversation = async (options: IPaginationOptions & { filter?: string }
) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);

    const { filter } = options;

    const whereCondition: any = {};

    if (filter === "USER" || filter === "BUYER") {
        whereCondition.tickerRole = filter;
    }

    const result = await prisma.ticket.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: {
            createdAt: "desc"
        },
        include: {
          ticketCreator: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
              email: true,
            }
          }
        }
    });


    const total = await prisma.ticket.count({ where: whereCondition });

    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
        data: result,
    };

}


const getMyTicketConversation = async (userId: string, options: IPaginationOptions & { filter?: string }
) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);

    const { filter } = options;

    const whereCondition: any = {
        ticketCreatorId: userId
    };
 

    const result = await prisma.ticket.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: {
            createdAt: "desc"
        },
        include: {
          ticketCreator: {
            select: {
              id: true,
              fullName: true,
              profileImage: true
            }
          },
          ticketReceiver: {
            select: {
              id: true,
              fullName: true,
              profileImage: true
            }
          }
        }
    });

    const total = await prisma.ticket.count({ where: whereCondition });

    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
        data: result,
    };

}




const markMessagesAsRead = async (userId: string, ticketId: string) => {
  await prisma.privateMessage.updateMany({
    where: {
      receiverId: userId,
      ticketId,
      read: false,
    },
    data: {
      read: true,
      updatedAt: new Date(),
    },
  });

  return { success: true, message: "Messages marked as read" };
};



 const getMergedMessageList = async (
  ticketId: string,
  userId: string,
  page?: number,
  limit?: number
) => {
  const redisKey = `ticket:messages:${ticketId}`;

  const [redisCount, dbCount] = await Promise.all([
    redis.zcard(redisKey),
    prisma.privateMessage.count({ where: { ticketId } }),
  ]);

  const total = redisCount + dbCount;
 
  if (!page || !limit) {
    
    const redisRaw = await redis.zrevrange(redisKey, 0, -1);
    const redisMessages = redisRaw.map((msg) => JSON.parse(msg));

    const dbMessages = await prisma.privateMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
    });

    return {
      messages: [...redisMessages, ...dbMessages],
      meta: {
        page: 1,
        limit: total,
        totalPage: 1,
        total,
      },
    };
  }

 
  const totalPage = Math.ceil(total / limit);
  const startIndex = total - page * limit;
  const endIndex = startIndex + limit - 1;

  const messages: any[] = [];

  if (endIndex < redisCount) {
    const redisStart = redisCount - 1 - endIndex;
    const redisEnd = redisCount - 1 - startIndex;

    const redisRaw = await redis.zrevrange(redisKey, redisStart, redisEnd);
    const redisMessages = redisRaw.map((msg) => JSON.parse(msg));

    messages.push(...redisMessages);
  } else if (startIndex < redisCount) {
    const redisStart = 0;
    const redisEnd = redisCount - 1 - startIndex;

    const redisRaw = await redis.zrevrange(redisKey, redisStart, redisEnd);
    const redisMessages = redisRaw.map((msg) => JSON.parse(msg));

    const remaining = limit - redisMessages.length;

    const dbMessages = await prisma.privateMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
      skip: 0,
      take: remaining,
    });

    messages.push(...redisMessages, ...dbMessages);
  } else {
    const dbSkip = startIndex - redisCount;

    const dbMessages = await prisma.privateMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
      skip: dbSkip,
      take: limit,
    });

    messages.push(...dbMessages);
  }

  return {
    messages,
    meta: {
      page,
      limit,
      totalPage,
      total,
    },
  };
};


const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
  const ticketInfo = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticketInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
  }

  await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      ticketStatus: status,
    },
  })

  return {
    message: "Ticket status updated successfully"
  }
}



export const TicketService = {
    createTicketIntoDB,
    getAllTicketConversation,
    getMyTicketConversation,
    markMessagesAsRead, 
    getMergedMessageList,
    updateTicketStatus
}