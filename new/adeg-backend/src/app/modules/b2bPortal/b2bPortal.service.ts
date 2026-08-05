import { create } from "domain";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../shared/pagination";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { getB2BPackagePricing, parseMOQ } from "../../../helpers/b2bPackage";

const getAllB2BPackages = async (
  options: IPaginationOptions & { search?: string },
) => {
  const { limit, skip, page } = paginationHelper.calculatePagination(options);
  const search = options.search;

  const productWhere: any = {
    isDeleted: false,
    isPublished: true,
    B2BPackage: {
        some: {},
      },
      shop: {
        status: "Approved"
      }
  };

  if (search) {
    productWhere.productName = {
      contains: search,
      mode: "insensitive",
    };
  }

  const totalProducts = await prisma.product.count({
    where: productWhere,
  });

  const products = await prisma.product.findMany({
    where: productWhere,
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
    select: {
      id: true,
      productName: true,
      productPhoto: true,
      avgRating: true,
      createdAt: true,
      shop: {
        select: {
          id: true,
          shopName: true,
          shopLogo: true,
          bannerImage: true,
          name: true,
          email: true,
          seller: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
        },
      },
      B2BPackage: {
        select: {
          id: true,
          quantity: true,
          price: true,
          moq: true,
          maxMOQ: true,
          pricePerUnit: true,
          b2bPackageTag: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  const data = products.map((product) => ({
    productId: product.id,
    productName: product.productName,
    productPhoto: product.productPhoto,
    avgRating: product.avgRating,
    createdAt: product.createdAt,
    seller: product.shop.seller,
    packages: product.B2BPackage.map((pkg) => {
      const moq = pkg.moq || parseMOQ(pkg.quantity);
      const pricing = moq ? getB2BPackagePricing(moq) : null;
      const perProductPrice =
        moq && moq > 0 ? parseFloat((pkg.price / moq).toFixed(2)) : null;

      return {
        id: pkg.id,
        quantity: pkg.quantity,
        moq,
        maxMOQ: pkg.maxMOQ || pricing?.maxMOQ || null,
        price: pkg.price,
        perProductPrice:
          pkg.pricePerUnit || pricing?.pricePerUnit || perProductPrice,
        b2bPackageTag: pkg.b2bPackageTag || pricing?.b2bPackageTag || null,
        createdAt: pkg.createdAt,
      };
    }),
  }));

  return {
    meta: {
      total: totalProducts,
      page,
      limit,
      totalPage: Math.ceil(totalProducts / limit),
    },
    data,
  };
};

const getB2BPackagesBySellerId = async (
  sellerId: string,
  options: IPaginationOptions & { search?: string },
) => {
  console.log({ sellerId, options });
  const { limit, skip, page } = paginationHelper.calculatePagination(options);
  const search = options.search;

  const sellerInfo = await prisma.user.findUnique({
    where: {
      id: sellerId,
      role: { in: ["SELLER", "ALL"] },
    },
  });

  if (!sellerInfo) {
    throw new ApiError(404, "Seller not found");
  }

  const productWhere: any = {
    isDeleted: false,
    isPublished: true,
    shop: {
      seller: {
        id: sellerId,
      },
    },
  };

  if (search) {
    productWhere.productName = {
      contains: search,
      mode: "insensitive",
    };
  }

  const totalProducts = await prisma.product.count({
    where: {
      ...productWhere,
      B2BPackage: {
        some: {},
      },
    },
  });

  const products = await prisma.product.findMany({
    where: {
      ...productWhere,
      B2BPackage: {
        some: {},
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
    select: {
      id: true,
      productName: true,
      productPhoto: true,
      avgRating: true,
      createdAt: true,
      shop: {
        select: {
          seller: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
        },
      },
      B2BPackage: {
        select: {
          id: true,
          quantity: true,
          price: true,
          moq: true,
          maxMOQ: true,
          pricePerUnit: true,
          b2bPackageTag: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  const data = products.map((product) => ({
    productId: product.id,
    productName: product.productName,
    productPhoto: product.productPhoto,
    avgRating: product.avgRating,
    createdAt: product.createdAt,
    seller: product.shop.seller,
    packages: product.B2BPackage.map((pkg) => {
      const moq = pkg.moq || parseMOQ(pkg.quantity);
      const pricing = moq ? getB2BPackagePricing(moq) : null;
      const perProductPrice =
        moq && moq > 0 ? parseFloat((pkg.price / moq).toFixed(2)) : null;

      return {
        id: pkg.id,
        quantity: pkg.quantity,
        moq,
        maxMOQ: pkg.maxMOQ || pricing?.maxMOQ || null,
        price: pkg.price,
        perProductPrice:
          pkg.pricePerUnit || pricing?.pricePerUnit || perProductPrice,
        b2bPackageTag: pkg.b2bPackageTag || pricing?.b2bPackageTag || null,
        createdAt: pkg.createdAt,
      };
    }),
  }));

  return {
    meta: {
      total: totalProducts,
      page,
      limit,
      totalPage: Math.ceil(totalProducts / limit),
    },
    data,
  };
};

// const getSellerB2BConversationList = async (sellerId: string) => {
//   const conversations = await prisma.conversation.findMany({
//     where: {
//       OR: [
//         {
//           chatType: "B2B",
//         },
//         {
//           B2BOffer: {
//             some: {
//               sellerId: sellerId,
//             },
//           },
//         },
//       ],
//     },
//     include: {
//       user1: {
//         select: {
//           id: true,
//           fullName: true,
//           profileImage: true,
//           email: true,
//         },
//       },
//       user2: {
//         select: {
//           id: true,
//           fullName: true,
//           profileImage: true,
//           email: true,
//         },
//       },
//     },
//     orderBy: {
//       updatedAt: "desc",
//     },
//   });

//   const formattedConversations = conversations.map((conv) => {
//     const otherUser = conv.user1Id === sellerId ? conv.user2 : conv.user1;

//     return {
//       conversationId: conv.id,
//       lastMessage: conv.lastMessage,
//       updatedAt: conv.updatedAt,
//       otherUser,
//     };
//   });

//   return formattedConversations;
// };

const getB2BConversationList = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  const [privateConversations, privateCount] = await Promise.all([
    prisma.conversation.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ user1Id: userId }, { user2Id: userId }],
        chatType: "B2B", 
      },

      select: {
        id: true,
        lastMessage: true,
        updatedAt: true,
        user1Id: true,
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
    prisma.conversation.count({
      where: {
        status: "ACTIVE",
        OR: [
          {
            OR: [{ user1Id: userId }, { user2Id: userId }],
            chatType: "B2B",
          },
          {
            B2BOffer: {
              some: {
                sellerId: userId,
              },
            },
          },
        ],
      },
    }),
  ]);

  // Map private conversations
  const privateConversationsData = await Promise.all(
    privateConversations.map(async (conv: any) => {
      const otherUser: any = conv?.user1Id === userId ? conv.user2 : conv.user1;

      return {
        conversationId: conv?.id,
        type: "private",
        participants: {
          userId: otherUser?.id || "",
          username: otherUser?.fullName || "",
          image: otherUser?.profileImage || "",
        },
        lastMessage: conv?.lastMessage || "",
        lastMessageTime: conv?.updatedAt || new Date(0),
        unseen: conv?._count?.privateMessages || 0,
      };
    }),
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

const getB2bDashboardStatics = async () => {
  const totalSellers = await prisma.user.count({
    where: {
      role: "SELLER",
    },
  });

  const totalContracts = await prisma.b2BOffer.count({
    where: {
      offerStuts: "ACCEPTED",
    },
  });

  const runningContacts = await prisma.b2BOffer.count({
    where: {
      offerStuts: "ACCEPTED",
      isDelivered: false,
      expectedDeliveryDate: {
        gte: new Date(),
      },
    },
  });

  const sellers = await prisma.user.findMany({
    where: { role: "SELLER" },
    select: {
      id: true,
      fullName: true,
      profileImage: true,
      sellerOffer: {
        where: { offerStuts: "ACCEPTED" },
        select: { id: true },
      },
    },
  });

  const topSellers = sellers
    .map((seller) => ({
      id: seller.id,
      fullName: seller.fullName,
      profileImage: seller.profileImage,
      acceptedContracts: seller.sellerOffer.length,
    }))
    .sort((a, b) => b.acceptedContracts - a.acceptedContracts)
    .slice(0, 5);

  return {
    totalSellers,
    totalContracts,
    runningContacts,
    topSellers,
  };
};

const getB2bDashboardChartData = async () => {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 6);

  const data = await prisma.b2BOffer.groupBy({
    by: ["createdAt"],
    where: {
      offerStuts: "ACCEPTED",
      createdAt: {
        gte: sevenDaysAgo,
        lte: now,
      },
    },
    _count: { id: true },
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const chartMap: Record<string, number> = {};
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dayName = days[date.getDay()];
    chartMap[dayName] = 0;
  }

  data.forEach((item) => {
    const dayName = days[new Date(item.createdAt).getDay()];
    chartMap[dayName] = (chartMap[dayName] || 0) + item._count.id;
  });

  return Object.keys(chartMap).map((day) => ({
    day,
    amount: chartMap[day],
    fill: chartMap[day] > 40 ? "#2563eb" : "#9ca3af",
  }));
};

const getB2BDashboardListing = async (
  options: IPaginationOptions & { search?: string; month?: string },
) => {
  const { month, search } = options;
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const whereCondition: any = {
    offerStuts: "ACCEPTED",
  };

  if (month) {
    const monthIndex = isNaN(Number(month))
      ? new Date(`${month} 1, ${new Date().getFullYear()}`).getMonth()
      : Number(month) - 1;

    const year = new Date().getFullYear();

    const startOfMonth = new Date(year, monthIndex, 1, 0, 0, 0);
    const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59);

    whereCondition.createdAt = {
      gte: startOfMonth,
      lte: endOfMonth,
    };
  }

  if (search) {
    whereCondition.OR = [
      {
        seller: {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const result = await prisma.b2BOffer.findMany({
    where: {
      ...whereCondition,
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      totalPrice: true,
      createdAt: true,
      expectedDeliveryDate: true,
      offerStuts: true,
      isDelivered: true,
      offer_Items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
      buyer: {
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
        },
      },
    },
  });

  const total = await prisma.b2BOffer.count({ where: whereCondition });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

export const B2BPortalService = {
  getAllB2BPackages,
  getB2BPackagesBySellerId,
  getB2BConversationList,
  getB2bDashboardStatics,
  getB2bDashboardChartData,
  getB2BDashboardListing,
};
