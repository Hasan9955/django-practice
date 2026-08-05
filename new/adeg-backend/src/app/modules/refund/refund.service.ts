import { PaymentStatus, RefundStatus } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { redis } from "../../../helpers/redis";
import prisma from "../../../shared/prisma"
import httpStatus from "http-status";
import { activeUsers } from "../../../socket";
import { storeAndSendRefundMessage } from "../../../utlits/socket.helpers";
import { PaymentController } from "../payment/payment.controller";
import { StripeServices } from "../payment/payment.service";



const createRefundConversation = async (payload: any, customerId: string) => {
  const { orderId, refundReason } = payload;

  const orderInfo = await prisma.order.findUnique({
    where: {
      id: orderId
    },
    select: {
      orderNumber: true,
      store: {
        select: {
          seller: {
            select: {
              id: true
            }
          }
        }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true
        }
      },
      variant: {
        select: {
          product: {
            select: {
              id: true,
              productName: true,
              productPhoto: true
            }
          }
        }
      }
    }
  })

  if (!orderInfo || !orderInfo.store || !orderInfo.store.seller) {
    throw new ApiError(404, "Order not found")
  }

  const result = await prisma.refund.create({
    data: {
      orderId,
      refundReason,
      customerId,
      sellerId: orderInfo?.store?.seller?.id
    }
  })

  const refundMessage = {
    refundReason: result.refundReason,
    orderNumber: orderInfo.orderNumber,
    customerName: orderInfo?.user?.fullName,
    customerImage: orderInfo?.user?.profileImage,
    productName: orderInfo?.variant?.product.productName,
    productImage: orderInfo?.variant?.product.productPhoto,
    productId: orderInfo?.variant?.product?.id,
  }
  const ws = activeUsers.get(orderInfo?.store?.seller?.id);

  if (ws) {
    storeAndSendRefundMessage(ws, customerId, orderInfo?.store?.seller?.id, JSON.stringify(refundMessage), "", result.id);
  }

  return {
    refundId: result.id,
    refundReason: result.refundReason,
    orderNumber: orderInfo.orderNumber,
    customerName: orderInfo?.user?.fullName,
    customerImage: orderInfo?.user?.profileImage,
    productName: orderInfo?.variant?.product.productName,
    productImage: orderInfo?.variant?.product.productPhoto,
    productId: orderInfo?.variant?.product?.id,
    sellerId: orderInfo?.store?.seller?.id
  };
}



const getRefundConversationListIntoDB = async (
  userId: string,
  options: { page: number; limit: number; search?: string; refundStatus?: RefundStatus }
) => {
  const page = options.page || 1;
  const limit = options.limit || 10;

  const skip = (page - 1) * limit;
  const { search } = options;

  const whereCondition: any = {
    AND: [
      {
        OR: [
          { customerId: userId },
          { sellerId: userId },
        ],
      },
    ],
  };


  if (search) {
    whereCondition.AND.push({
      OR: [
        { seller: { fullName: { contains: search, mode: "insensitive" } } },
        { seller: { email: { contains: search, mode: "insensitive" } } },
        { customer: { fullName: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  if (options.refundStatus) {
    whereCondition.AND.push({ refundStatus: options.refundStatus });
  }






  const [privateConversations, privateCount] = await Promise.all([
    prisma.refund.findMany({
      where: whereCondition,
      select: {
        id: true,
        refundReason: true,
        refundStatus: true,
        updatedAt: true,
        customerId: true,
        customer: {
          select: {
            id: true,
            profileImage: true,
            fullName: true,
          },
        },
        seller: {
          select: {
            id: true,
            profileImage: true,
            fullName: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
            variant: {
              select: {
                product: {
                  select: {
                    id: true,
                    productName: true,
                    productPhoto: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            privateMessage: {
              where: {
                receiverId: userId,
                read: false,
              },
            },
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      skip,
      take: limit,
    }),
    prisma.refund.count({
      where: whereCondition,
    }),
  ]);

  // Map private conversations
  const privateConversationsData = await Promise.all(
    privateConversations.map(async (conv: any) => {
      const otherUser: any = conv?.customerId === userId ? conv.seller : conv.customer;

      return {
        refundConversationId: conv?.id,
        refundReason: conv?.refundReason,
        refundStatus: conv?.refundStatus,
        type: "refund",
        participants: {
          userId: otherUser?.id || "",
          username: otherUser?.fullName || "",
          image: otherUser?.profileImage || "",
        },
        productId: conv?.order?.variant?.product?.id,
        productName: conv?.order?.variant?.product?.productName,
        productImage: conv?.order?.variant?.product?.productPhoto,
        orderNumber: conv?.order?.orderNumber,
        lastMessage: conv?.lastMessage || "",
        lastMessageTime: conv?.updatedAt || new Date(0),
        unseen: conv?._count?.privateMessages || 0,
      };
    })
  );

  const totalPages = Math.ceil(privateCount / limit);

  const result = {
    result: privateConversationsData,
    meta: {
      page: totalPages,
      limit: limit,
      total: privateCount,
    },
  };
  return result;
};


const markMessagesAsRead = async (userId: string, refundConversationId: string) => {
  await prisma.privateMessage.updateMany({
    where: {
      receiverId: userId,
      refundId: refundConversationId,
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
  refundId: string,
  userId: string,
  page?: number,
  limit?: number
) => {
  const redisKey = `refund:messages:${refundId}`;

  const [redisCount, dbCount] = await Promise.all([
    redis.zcard(redisKey),
    prisma.privateMessage.count({ where: { refundId } }),
  ]);

  const total = redisCount + dbCount;

  if (!page || !limit) {

    const redisRaw = await redis.zrevrange(redisKey, 0, -1);
    const redisMessages = redisRaw.map((msg) => JSON.parse(msg));

    const dbMessages = await prisma.privateMessage.findMany({
      where: { refundId },
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
      where: { refundId },
      orderBy: { createdAt: "desc" },
      skip: 0,
      take: remaining,
    });

    messages.push(...redisMessages, ...dbMessages);
  } else {
    const dbSkip = startIndex - redisCount;

    const dbMessages = await prisma.privateMessage.findMany({
      where: { refundId },
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


const updateRefundStatus = async (refundId: string, status: RefundStatus) => {
  const ticketInfo = await prisma.refund.findUnique({
    where: {
      id: refundId,
    },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          payment: {
            select: {
              id: true,
              paymentIntentId: true
            }
          }
        }
      }
    }
  });

  if (!ticketInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, "Refund not found");
  }

  const paymentIntentId = ticketInfo.order.payment.paymentIntentId as string

  if (status === RefundStatus.APPROVED && paymentIntentId) {
    const refund = await StripeServices.refundPaymentToCustomer({
      paymentIntentId,
    });


    await prisma.refund.update({
      where: {
        id: refundId,
      },
      data: {
        refundStatus: RefundStatus.APPROVED,
      },
    })

    await prisma.order.update({
      where: {
        id: ticketInfo.order.id,
      },
      data: {
        orderStatus: "Refunded",
      },
    })

    await prisma.payment.update({
      where: {
        id: ticketInfo.order.payment.id,
      },
      data: {
        status: PaymentStatus.Refund,
      },
    })
  }

  await prisma.refund.update({
    where: {
      id: refundId,
    },
    data: {
      refundStatus: status,
    },
  })

  return {
    message: "Refund status updated successfully"
  }
}


const getRefundConversationListForAdmin = async (
  options: { page: number; limit: number; search?: string, refundStatus?: RefundStatus }
) => {
  const page = options.page || 1;
  const limit = options.limit || 10;

  const skip = (page - 1) * limit;

  const whereCondition: any = {};


  if (options.search) {
    whereCondition.OR = [
      { seller: { fullName: { contains: options.search, mode: "insensitive" } } },
      { seller: { email: { contains: options.search, mode: "insensitive" } } },
      { customer: { fullName: { contains: options.search, mode: "insensitive" } } },
      { customer: { email: { contains: options.search, mode: "insensitive" } } },
    ];
  }

  if (options.refundStatus) {
    whereCondition.refundStatus = options.refundStatus;
  }


  const [privateConversations, privateCount] = await Promise.all([
    prisma.refund.findMany({
      where: whereCondition,
      select: {
        id: true,
        refundReason: true,
        refundStatus: true,
        updatedAt: true,
        customerId: true,
        customer: {
          select: {
            id: true,
            profileImage: true,
            fullName: true,
          },
        },
        seller: {
          select: {
            id: true,
            profileImage: true,
            fullName: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
            variant: {
              select: {
                product: {
                  select: {
                    id: true,
                    productName: true,
                    basePrice: true,
                    productPhoto: true
                  }
                }
              }
            }
          }
        },
        _count: true
      },
      orderBy: [{ updatedAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.refund.count({
      where: whereCondition,
    }),
  ]);

  // Map private conversations
  const privateConversationsData = await Promise.all(
    privateConversations.map(async (conv: any) => {
      // const otherUser: any = conv?.customerId === userId ? conv.seller : conv.customer;

      return {
        refundConversationId: conv?.id,
        refundReason: conv?.refundReason,
        refundStatus: conv?.refundStatus,
        type: "refund",
        participants: {
          user: conv?.customer,
          seller: conv?.seller
        },
        productId: conv?.order?.variant?.product?.id,
        productName: conv?.order?.variant?.product?.productName,
        productImage: conv?.order?.variant?.product?.productPhoto,
        productPrice: conv?.order?.variant?.product?.basePrice,
        orderNumber: conv?.order?.orderNumber,
        lastMessage: conv?.lastMessage || "",
        lastMessageTime: conv?.updatedAt || new Date(0),
        unseen: conv?._count?.privateMessages || 0,
      };
    })
  );

  const totalPages = Math.ceil(privateCount / limit);

  const result = {
    result: privateConversationsData,
    meta: {
      page: totalPages,
      limit: limit,
      total: privateCount,
    },
  };
  return result;
};


export const refundServices = {
  createRefundConversation,
  getRefundConversationListIntoDB,
  markMessagesAsRead,
  getMergedMessageList,
  updateRefundStatus,
  getRefundConversationListForAdmin
}