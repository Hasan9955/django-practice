import { ChatType, MessageType } from "@prisma/client";
import { redis } from "../../../helpers/redis";
import prisma from "../../../shared/prisma";
import { fileUploader } from "../../middlewares/fileUploder";

const extractOfferIdFromMessage = (message: any): string | null => {
  if (!message) return null;

  if (typeof message.offerId === "string") {
    return message.offerId;
  }

  const content = message.content;

  if (content && typeof content === "object") {
    if (typeof content.offerId === "string") {
      return content.offerId;
    }
    if (typeof content.id === "string") {
      return content.id;
    }
  }

  if (typeof content === "string") {
    try {
      const parsedContent = JSON.parse(content);
      if (typeof parsedContent?.offerId === "string") {
        return parsedContent.offerId;
      }
      if (typeof parsedContent?.id === "string") {
        return parsedContent.id;
      }
    } catch {
      return null;
    }
  }

  return null;
};

const hydrateOfferMessages = async (messages: any[]) => {
  const offerIds = Array.from(
    new Set(
      messages
        .filter((message) => message?.messageType === "OFFER")
        .map((message) => extractOfferIdFromMessage(message))
        .filter(Boolean),
    ),
  ) as string[];

  if (!offerIds.length) {
    return messages;
  }

  const offers = await prisma.b2BOffer.findMany({
    where: {
      id: { in: offerIds },
    },
    include: {
      offer_Items: {
        select: {
          id: true,
          offerId: true,
          productId: true,
          unitPrice: true,
          quantity: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      buyer: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
    },
  });

  const productIds = Array.from(
    new Set(
      offers
        .flatMap((offer) => offer.offer_Items.map((item) => item.productId))
        .filter(Boolean),
    ),
  );

  const products = productIds.length
    ? await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
        select: {
          id: true,
          productName: true,
          productPhoto: true,
        },
      })
    : [];

  const productMap = new Map(products.map((product) => [product.id, product]));

  const normalizedOffers = offers.map((offer) => ({
    ...offer,
    offer_Items: offer.offer_Items.map((item) => ({
      ...item,
      product: productMap.get(item.productId) ?? null,
    })),
  }));

  const offerMap = new Map(normalizedOffers.map((offer) => [offer.id, offer]));

  return messages.map((message) => {
    if (message?.messageType !== "OFFER") {
      return message;
    }

    const offerId = extractOfferIdFromMessage(message);
    if (!offerId) {
      return message;
    }

    const offer = offerMap.get(offerId);
    if (!offer) {
      return message;
    }

    return {
      ...message,
      offerId,
      content: {
        offerId,
        offerData: offer,
      },
    };
  });
};

interface SendWhatsAppMessageOptions {
  phoneNumber: string;
  templateName?: string;
  languageCode?: string;
  text?: any;
  isReply: boolean;
}
const createConversationIntoDB = async (
  user1Id: string,
  user2Id: string,
  chatType?: ChatType,
) => {
  try {
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id, user2Id },
          { user1Id: user2Id, user2Id: user1Id },
        ],
      },
      select: {
        id: true,
        chatType: true,
      },
    });

    if (existingConversation && chatType === "B2B") {
      if (existingConversation?.chatType !== "B2B") {
        await prisma.conversation.update({
          where: {
            id: existingConversation?.id,
          },
          data: {
            chatType: "B2B",
          },
        });
      }
    }

    if (existingConversation) {
      return existingConversation;
    }
    const newConversation = await prisma.conversation.create({
      data: {
        user1Id,
        user2Id,
        chatType,
      },
      select: {
        id: true,
      },
    });
    return newConversation;
  } catch (error) {
    console.error("Error creating or finding conversation:", error);
  }
};

const chatImageUploadIntoDB = async (file: Express.Multer.File) => {
  console.log(file);
  // const image = await fileUploader.uploadToDigitalOcean(file);
  const image = await fileUploader.uploadToDigitalOcean(file);
  return image.Location;
};

const chatAudioUploadIntoDB = async (file: Express.Multer.File) => {
  const audio = await fileUploader.uploadToDigitalOcean(file);
  return audio;
};

// const getConversationListIntoDB = async (
//   userId: string,
//   page: number = 1,
//   limit: number = 10,
// ) => {
//   const skip = (page - 1) * limit;
 


//   const conversations = await prisma.conversation.findMany({
//     where: {
//       OR: [{ user1Id: userId }, { user2Id: userId }],
//       status: "ACTIVE",
//       // This checks the ENTIRE DB history for this message type
//       privateMessage: {
//         some: {
//           messageType: "PRIVATEMESSAGE",
//         },
//       },
//     },
//     include: {
//       user1: { select: { id: true, profileImage: true, fullName: true } },
//       user2: { select: { id: true, profileImage: true, fullName: true } },
//     },
//     orderBy: { updatedAt: "desc" },
//   });

//   const allActiveConvos = await prisma.conversation.findMany({
//     where: {
//       OR: [{ user1Id: userId }, { user2Id: userId }],
//       status: "ACTIVE",
//     },
//     include: {
//       user1: { select: { id: true, profileImage: true, fullName: true } },
//       user2: { select: { id: true, profileImage: true, fullName: true } },
//     },
//   });

//   const finalItems = [];

//   for (const conv of allActiveConvos) {
//     const redisKey = `chat:messages:${conv.id}`;
//     const redisRaw = await redis.zrevrange(redisKey, 0, -1);
//     const redisMessages = redisRaw.map((m) => JSON.parse(m));
 
 
//     const hasInRedis = redisMessages.some(
//       (m) => m.chatType === "PRIVATEMESSAGE",
//     );
 
//     const dbMatch = await prisma.privateMessage.findFirst({
//       where: { conversationId: conv.id, messageType: "PRIVATEMESSAGE" },
//       orderBy: { createdAt: "desc" },
//     });

//     if (hasInRedis || dbMatch) {
//       // Find the most recent message of this type for the preview
//       const latestRedis = redisMessages.find(
//         (m) => m.chatType === "PRIVATEMESSAGE",
//       );

//       let previewText = "";
//       let previewTime = new Date(0);

//       if (
//         latestRedis &&
//         (!dbMatch ||
//           new Date(latestRedis.createdAt) > new Date(dbMatch.createdAt))
//       ) {
//         previewText = latestRedis.message;
//         previewTime = latestRedis.createdAt;
//       } else if (dbMatch) {
//         previewText =
//           typeof dbMatch.content === "string" ? dbMatch.content : "Attachment";
//         previewTime = dbMatch.createdAt;
//       }

//       const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;

//       finalItems.push({
//         conversationId: conv.id,
//         participants: {
//           userId: otherUser?.id || "",
//           username: otherUser?.fullName || "",
//           image: otherUser?.profileImage || "",
//         },
//         lastMessage: previewText,
//         lastMessageTime: previewTime,
//         // Unseen count should also be filtered by type
//         unseen: await prisma.privateMessage.count({
//           where: {
//             conversationId: conv.id,
//             receiverId: userId,
//             read: false,
//             messageType: "PRIVATEMESSAGE",
//           },
//         }),
//       });
//     }
//   }
 
//   finalItems.sort(
//     (a, b) =>
//       new Date(b.lastMessageTime).getTime() -
//       new Date(a.lastMessageTime).getTime(),
//   );
 
//   const result = finalItems.slice(skip, skip + limit);

//   return {
//     result,
//     meta: {
//       page,
//       limit,
//       total: finalItems.length,
//       totalPage: Math.ceil(finalItems.length / limit),
//     },
//   };
// };

const getConversationListIntoDB = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  // Get all active conversations
  const allActiveConvos = await prisma.conversation.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
      status: "ACTIVE",
    },
    include: {
      user1: {
        select: {
          id: true,
          profileImage: true,
          fullName: true,
        },
      },
      user2: {
        select: {
          id: true,
          profileImage: true,
          fullName: true,
        },
      },
    },
  });

  const finalItems = await Promise.all(
    allActiveConvos.map(async (conv) => {
      const redisKey = `chat:messages:${conv.id}`;

      // Get messages from Redis
      const redisRaw = await redis.zrevrange(redisKey, 0, -1);

      const redisMessages = redisRaw.map((m) => JSON.parse(m));

      // Latest private message from Redis
      const latestRedis = redisMessages.find(
        (m) => m.messageType === "PRIVATEMESSAGE",
      );

      // Latest private message from DB
      const dbMatch = await prisma.privateMessage.findFirst({
        where: {
          conversationId: conv.id,
          messageType: "PRIVATEMESSAGE",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // If no message exists in both Redis & DB
      if (!latestRedis && !dbMatch) {
        return null;
      }

      let previewText = "No message";
      let previewTime: Date = new Date(0);

      // Compare latest Redis vs DB message
      if (
        latestRedis &&
        (!dbMatch ||
          new Date(latestRedis.createdAt) >
            new Date(dbMatch.createdAt))
      ) {
        previewText =
          typeof latestRedis.message === "string"
            ? latestRedis.message
            : "Attachment";

        previewTime = new Date(latestRedis.createdAt);
      } else if (dbMatch) {
        previewText =
          typeof dbMatch.content === "string"
            ? dbMatch.content
            : "Attachment";

        previewTime = new Date(dbMatch.createdAt);
      }

      // Find other participant
      const otherUser =
        conv.user1Id === userId ? conv.user2 : conv.user1;

      // Unseen message count
      const unseenCount = await prisma.privateMessage.count({
        where: {
          conversationId: conv.id,
          receiverId: userId,
          read: false,
          messageType: "PRIVATEMESSAGE",
        },
      });

      return {
        conversationId: conv.id,

        participants: {
          userId: otherUser?.id || "",
          username: otherUser?.fullName || "",
          image: otherUser?.profileImage || "",
        },

        lastMessage: previewText,

        lastMessageTime: previewTime,

        unseen: unseenCount,
      };
    }),
  );

  // Remove null conversations
  const filteredItems = finalItems.filter(Boolean);

  // Sort latest message first
  filteredItems.sort(
    (a: any, b: any) =>
      new Date(b.lastMessageTime).getTime() -
      new Date(a.lastMessageTime).getTime(),
  );

  // Pagination
  const result = filteredItems.slice(skip, skip + limit);

  return {
    result,

    meta: {
      page,
      limit,
      total: filteredItems.length,
      totalPage: Math.ceil(filteredItems.length / limit),
    },
  };
};

// const getConversationListIntoDB = async (
//   userId: string,
//   page: number = 1,
//   limit: number = 10,
// ) => {
//   const skip = (page - 1) * limit;

//   const [privateConversations, privateCount] = await Promise.all([
//     prisma.conversation.findMany({
//       where: {
//         OR: [{ user1Id: userId }, { user2Id: userId }],
//         status: "ACTIVE",
//         privateMessage: {
//           some: {
//             messageType: "PRIVATEMESSAGE",
//           },
//         },
//       },

//       select: {
//         id: true,
//         lastMessage: true,
//         updatedAt: true,
//         user1Id: true,
//         user1: {
//           select: {
//             id: true,
//             profileImage: true,
//             fullName: true,
//           },
//         },
//         user2: {
//           select: {
//             id: true,
//             profileImage: true,
//             fullName: true,
//           },
//         },
//         _count: {
//           select: {
//             privateMessage: {
//               where: {
//                 receiverId: userId,
//                 read: false,
//               },
//             },
//           },
//         },
//       },
//       orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
//       skip,
//       take: limit,
//     }),
//     prisma.conversation.count({
//       where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
//     }),
//   ]);

//   // Map private conversations
//   const privateConversationsData = await Promise.all(
//     privateConversations.map(async (conv: any) => {
//       const otherUser: any = conv?.user1Id === userId ? conv.user2 : conv.user1;

//       return {
//         conversationId: conv?.id,
//         type: "private",
//         participants: {
//           userId: otherUser?.id || "",
//           username: otherUser?.fullName || "",
//           image: otherUser?.profileImage || "",
//         },
//         lastMessage: conv?.lastMessage || "",
//         lastMessageTime: conv?.updatedAt || new Date(0),
//         unseen: conv?._count?.privateMessages || 0,
//       };
//     }),
//   );

//   const totalPages = Math.ceil(privateCount / limit);

//   const result = {
//     result: privateConversationsData,
//     meta: {
//       page: totalPages,
//       limit: limit,
//       total: privateCount,
//     },
//   };
//   return result;
// };

//  const getMergedMessageListV1 = async (
//   conversationId: string,
//   userId: string,
//   page?: number,
//   limit?: number,
//   messageType?: MessageType
// ) => {
//   const redisKey = `chat:messages:${conversationId}`;

//   const [redisCount, dbCount] = await Promise.all([
//     redis.zcard(redisKey),
//     prisma.privateMessage.count({ where: { conversationId } }),
//   ]);

//   const total = redisCount + dbCount;

//   if (!page || !limit) {

//     const redisRaw = await redis.zrevrange(redisKey, 0, -1);
//     const redisMessages = redisRaw.map((msg) => JSON.parse(msg));

//     const dbMessages = await prisma.privateMessage.findMany({
//       where: { conversationId },
//       orderBy: { createdAt: "desc" },
//     });

//     const mergedMessages = [...redisMessages, ...dbMessages];
//     const hydratedMessages = await hydrateOfferMessages(mergedMessages);

//     return {
//       messages: hydratedMessages,
//       meta: {
//         page: 1,
//         limit: total,
//         totalPage: 1,
//         total,
//       },
//     };
//   }

//   const totalPage = Math.ceil(total / limit);
//   const startIndex = total - page * limit;
//   const endIndex = startIndex + limit - 1;

//   const messages: any[] = [];

//   if (endIndex < redisCount) {
//     const redisStart = redisCount - 1 - endIndex;
//     const redisEnd = redisCount - 1 - startIndex;

//     const redisRaw = await redis.zrevrange(redisKey, redisStart, redisEnd);
//     const redisMessages = redisRaw.map((msg) => JSON.parse(msg));

//     messages.push(...redisMessages);
//   } else if (startIndex < redisCount) {
//     const redisStart = 0;
//     const redisEnd = redisCount - 1 - startIndex;

//     const redisRaw = await redis.zrevrange(redisKey, redisStart, redisEnd);
//     const redisMessages = redisRaw.map((msg) => JSON.parse(msg));

//     const remaining = limit - redisMessages.length;

//     const dbMessages = await prisma.privateMessage.findMany({
//       where: { conversationId },
//       orderBy: { createdAt: "desc" },
//       skip: 0,
//       take: remaining,
//     });

//     messages.push(...redisMessages, ...dbMessages);
//   } else {
//     const dbSkip = startIndex - redisCount;

//     const dbMessages = await prisma.privateMessage.findMany({
//       where: { conversationId },
//       orderBy: { createdAt: "desc" },
//       skip: dbSkip,
//       take: limit,
//     });

//     messages.push(...dbMessages);
//   }

//   const hydratedMessages = await hydrateOfferMessages(messages);

//   return {
//     messages: hydratedMessages,
//     meta: {
//       page,
//       limit,
//       totalPage,
//       total,
//     },
//   };
// };

// const getMergedMessageListV2 = async (
//   conversationId: string,
//   userId: string,
//   page?: number,
//   limit?: number,
//   messageType?: MessageType, // Assuming this is "OFFER" | "B2B" | "PRIVATEMESSAGE"
// ) => {
//   const redisKey = `chat:messages:${conversationId}`;

//   // Define the type grouping
//   const isOfferGroup = messageType === "OFFER" || messageType === "B2B";
//   const targetTypes = isOfferGroup ? ["OFFER", "B2B"] : [messageType];

//   // 1. Update DB Query Filter
//   const dbWhere: any = { conversationId };
//   if (messageType) {
//     dbWhere.messageType = { in: targetTypes };
//   }

//   // Note: Filtering Redis requires fetching then filtering, which affects pagination counts
//   // For high performance, you'd usually store separate Redis sets per type.
//   // Below is the logic to handle it within your current structure:

//   const [redisRawAll, dbCount] = await Promise.all([
//     redis.zrevrange(redisKey, 0, -1),
//     prisma.privateMessage.count({ where: dbWhere }),
//   ]);

//   // 2. Filter Redis messages in memory
//   let redisMessages = redisRawAll.map((msg) => JSON.parse(msg));

//   if (messageType) {
//     redisMessages = redisMessages.filter((msg) =>
//       targetTypes.includes(msg.chatType),
//     );
//   }

//   const redisCount = redisMessages.length;
//   const total = redisCount + dbCount;

//   // --- Pagination Logic ---
//   if (!page || !limit) {
//     const dbMessages = await prisma.privateMessage.findMany({
//       where: dbWhere,
//       orderBy: { createdAt: "desc" },
//     });

//     const mergedMessages = [...redisMessages, ...dbMessages];
//     const hydratedMessages = await hydrateOfferMessages(mergedMessages);

//     return {
//       messages: hydratedMessages,
//       meta: { page: 1, limit: total, totalPage: 1, total },
//     };
//   }

//   const totalPage = Math.ceil(total / limit);
//   const skip = (page - 1) * limit; // Standard pagination usually uses (page-1) * limit

//   // Slice from the merged list or use your existing index logic
//   // Adjusted for filtered results:
//   let resultMessages = [];

//   // Logic to pull from filtered Redis first, then DB
//   if (skip < redisCount) {
//     const redisSlice = redisMessages.slice(skip, skip + limit);
//     resultMessages.push(...redisSlice);

//     if (resultMessages.length < limit) {
//       const dbTake = limit - resultMessages.length;
//       const dbMessages = await prisma.privateMessage.findMany({
//         where: dbWhere,
//         orderBy: { createdAt: "desc" },
//         take: dbTake,
//         skip: 0,
//       });
//       resultMessages.push(...dbMessages);
//     }
//   } else {
//     const dbSkip = skip - redisCount;
//     const dbMessages = await prisma.privateMessage.findMany({
//       where: dbWhere,
//       orderBy: { createdAt: "desc" },
//       take: limit,
//       skip: dbSkip,
//     });
//     resultMessages.push(...dbMessages);
//   }

//   const hydratedMessages = await hydrateOfferMessages(resultMessages);
//   return {
//     messages: hydratedMessages,
//     meta: { page, limit, totalPage, total },
//   };
// };


// const getMergedMessageListV3 = async (
//   conversationId: string,
//   userId: string,
//   page?: number,
//   limit?: number,
//   messageType?: MessageType,
// ) => {
//   const redisKey = `chat:messages:${conversationId}`;

//   // 1. Define the Grouping Logic
//   const isOfferGroup = messageType === "OFFER" || messageType === "B2B";
  
//   // 2. Construct DB Filter
//   const dbWhere: any = { conversationId };

//   if (messageType) {
//     if (isOfferGroup) {
//       // Logic: Is explicitly OFFER/B2B OR is a PrivateMessage with an offerId
//       dbWhere.OR = [
//         { messageType: { in: ["OFFER", "B2B"] } },
//         { 
//           AND: [
//             { messageType: "PRIVATEMESSAGE" },
//             { offerId: { not: null } } 
//           ]
//         }
//       ];
//     } else {
//       // Logic for standard PRIVATEMESSAGE (only those WITHOUT an offerId)
//       dbWhere.messageType = "PRIVATEMESSAGE";
//       dbWhere.offerId = null;
//     }
//   }

//   const [redisRawAll, dbCount] = await Promise.all([
//     redis.zrevrange(redisKey, 0, -1),
//     prisma.privateMessage.count({ where: dbWhere }),
//   ]);

//   // 3. Filter Redis messages in memory
//   let redisMessages = redisRawAll.map((msg) => JSON.parse(msg));

//   if (messageType) {
//     redisMessages = redisMessages.filter((msg) => {
//       const hasOfferId = msg.offerId !== null && msg.offerId !== undefined;
      
//       if (isOfferGroup) {
//         // Include if type matches OR if it's a private message with an offerId
//         return ["OFFER", "B2B"].includes(msg.chatType) || 
//                (msg.chatType === "PRIVATEMESSAGE" && hasOfferId);
//       } else {
//         // Pure private messages only (no offerId)
//         return msg.chatType === "PRIVATEMESSAGE" && !hasOfferId;
//       }
//     });
//   }

//   const redisCount = redisMessages.length;
//   const total = redisCount + dbCount;

//   // --- Pagination Logic (Remains largely the same, but using the new dbWhere) ---
//   if (!page || !limit) {
//     const dbMessages = await prisma.privateMessage.findMany({
//       where: dbWhere,
//       orderBy: { createdAt: "desc" },
//     });

//     const mergedMessages = [...redisMessages, ...dbMessages];
//     const hydratedMessages = await hydrateOfferMessages(mergedMessages);

//     return {
//       messages: hydratedMessages,
//       meta: { page: 1, limit: total, totalPage: 1, total },
//     };
//   }

//   const totalPage = Math.ceil(total / limit);
//   const skip = (page - 1) * limit;

//   let resultMessages = [];

//   if (skip < redisCount) {
//     const redisSlice = redisMessages.slice(skip, skip + limit);
//     resultMessages.push(...redisSlice);

//     if (resultMessages.length < limit) {
//       const dbTake = limit - resultMessages.length;
//       const dbMessages = await prisma.privateMessage.findMany({
//         where: dbWhere,
//         orderBy: { createdAt: "desc" },
//         take: dbTake,
//         skip: 0,
//       });
//       resultMessages.push(...dbMessages);
//     }
//   } else {
//     const dbSkip = skip - redisCount;
//     const dbMessages = await prisma.privateMessage.findMany({
//       where: dbWhere,
//       orderBy: { createdAt: "desc" },
//       take: limit,
//       skip: dbSkip,
//     });
//     resultMessages.push(...dbMessages);
//   }

//   const hydratedMessages = await hydrateOfferMessages(resultMessages);
//   return {
//     messages: hydratedMessages,
//     meta: { page, limit, totalPage, total },
//   };
// };

const getMergedMessageList = async (
  conversationId: string,
  userId: string,
  page?: number,
  limit?: number,
  messageType?: MessageType,
) => {
  const redisKey = `chat:messages:${conversationId}`;

  // 1. Define Filter Groups
  // We treat B2B and OFFER as the same logical group for this filter
  const isB2BGroup = messageType === "B2B" || messageType === "OFFER";
  
  // 2. Construct Prisma Query Filter
  const dbWhere: any = { conversationId };

  if (messageType) {
    if (isB2BGroup) {
      // Logic: Explicit B2B/OFFER OR PrivateMessage with an offerId
      dbWhere.OR = [
        { messageType: { in: ["OFFER", "B2B"] } },
        { 
          AND: [
            { messageType: "PRIVATEMESSAGE" },
            { offerId: { not: null } } 
          ]
        }
      ];
    } else if (messageType === "PRIVATEMESSAGE") {
      // Logic: Only pure PrivateMessages (no offerId)
      dbWhere.messageType = "PRIVATEMESSAGE";
      dbWhere.offerId = null;
    }
  }

  // 3. Fetch Data and Counts
  const [redisRawAll, dbCount] = await Promise.all([
    redis.zrevrange(redisKey, 0, -1),
    prisma.privateMessage.count({ where: dbWhere }),
  ]);

  // 4. Filter Redis messages in memory
  let redisMessages = redisRawAll.map((msg) => JSON.parse(msg));

  if (messageType) {
    redisMessages = redisMessages.filter((msg) => {
      // Check for existence of offerId in the JSON object
      const hasOfferId = msg.offerId !== null && msg.offerId !== undefined;
      
      if (isB2BGroup) {
        // Return if it's explicitly a business type OR a private msg with an offerId
        return ["OFFER", "B2B"].includes(msg.chatType) || hasOfferId;
      } else {
        // Return only pure private messages (exclude those with offerIds)
        return msg.chatType === "PRIVATEMESSAGE" && !hasOfferId;
      }
    });
  }

  const redisCount = redisMessages.length;
  const total = redisCount + dbCount;

  // --- 5. Pagination Logic ---
  
  // Handle case with no pagination (return all)
  if (!page || !limit) {
    const dbMessages = await prisma.privateMessage.findMany({
      where: dbWhere,
      orderBy: { createdAt: "desc" },
    });

    const mergedMessages = [...redisMessages, ...dbMessages];
    const hydratedMessages = await hydrateOfferMessages(mergedMessages);

    return {
      messages: hydratedMessages,
      meta: { page: 1, limit: total, totalPage: 1, total },
    };
  }

  const totalPage = Math.ceil(total / limit);
  const skip = (page - 1) * limit;
  let resultMessages = [];

  // Logic: Pull from Redis first, then fill remainder from DB
  if (skip < redisCount) {
    const redisSlice = redisMessages.slice(skip, skip + limit);
    resultMessages.push(...redisSlice);

    // If Redis didn't have enough to fill the 'limit', fetch the rest from DB
    if (resultMessages.length < limit) {
      const dbTake = limit - resultMessages.length;
      const dbMessages = await prisma.privateMessage.findMany({
        where: dbWhere,
        orderBy: { createdAt: "desc" },
        take: dbTake,
        skip: 0,
      });
      resultMessages.push(...dbMessages);
    }
  } else {
    // If the skip starts beyond Redis, fetch only from DB
    const dbSkip = skip - redisCount;
    const dbMessages = await prisma.privateMessage.findMany({
      where: dbWhere,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: dbSkip,
    });
    resultMessages.push(...dbMessages);
  }

  // 6. Hydrate and Return
  const hydratedMessages = await hydrateOfferMessages(resultMessages);
  
  return {
    messages: hydratedMessages,
    meta: { 
      page, 
      limit, 
      totalPage: totalPage || 1, 
      total 
    },
  };
};

const markMessagesAsRead = async (userId: string, conversationId: string) => {
  await prisma.privateMessage.updateMany({
    where: {
      receiverId: userId,
      conversationId: conversationId,
      read: false,
    },
    data: {
      read: true,
      updatedAt: new Date(),
    },
  });

  return { success: true, message: "Messages marked as read" };
};

export const chatService = {
  getConversationListIntoDB,
  createConversationIntoDB,
  getMergedMessageList,
  markMessagesAsRead,
  chatImageUploadIntoDB,
  chatAudioUploadIntoDB,
};
