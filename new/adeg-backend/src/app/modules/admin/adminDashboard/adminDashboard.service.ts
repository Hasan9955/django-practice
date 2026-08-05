import { IntervalType, OrderEnum, storeStatus, SubscriptionStatus, SubscriptionType } from "@prisma/client";
import ApiError from "../../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../../interfaces/paginations";
import { paginationHelper } from "../../../../shared/pagination";
import prisma from "../../../../shared/prisma";

const getAllSellerList = async (options: IPaginationOptions & { 
  search?: string, 
  status?: storeStatus,
  sortBy?: 'newest' | 'oldest' | 'nameAsc' | 'nameDesc' | 'salesHigh' | 'salesLow' | 'revenueHigh' | 'revenueLow',
  storeFilter?: 'all' | 'hasStore' | 'noStore'
}) => {

  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { search, status, sortBy = 'newest', storeFilter = 'all' } = options;

  const whereCondition: any = {
    role: { in: ["SELLER", "ALL"] },
  };

  // Search filter
  if (search) {
    whereCondition.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { fullName: { contains: search, mode: "insensitive" } },
      { companyName: { contains: search, mode: "insensitive" } },
    ];
  }

  // Status filter (if you want to filter by store status)
  if (status) {
    whereCondition.store = {
      some: { status: status }
    };
  }

  // Get all sellers first to calculate stats
  const sellers = await prisma.user.findMany({
    where: whereCondition,
    include: {
      store: true,
    },
  });
 

  // Calculate stats for each seller
  let sellerStats = await Promise.all(
    sellers.map(async (seller) => {
      const storeIds = seller.store.map((s) => s.id);

      const totalProducts = await prisma.product.count({
        where: { storeId: { in: storeIds }, isDeleted: false, isPublished: true },
      });

      const orders = await prisma.order.findMany({
        where: { storeId: { in: storeIds }, isPaid: true },
        select: { price: true, quantity: true },
      });
 

      const totalSales = orders.reduce((sum, o) => sum + o.quantity, 0);

      const totalRevenue = orders.reduce(
        (sum, o) => sum + o.price * o.quantity,
        0,
      );

      const store = seller.store.length > 0 ? seller.store[0] : null;

      return {
        id: seller.id,
        fullName: seller.fullName,
        email: seller.email,
        phoneNumber: seller.phoneNumber,
        companyName: seller.companyName,
        profileImage: seller.profileImage,
        storeId: store?.id || null,
        storeName: store?.shopName || null,
        storeStatus: store?.status || null,
        totalProducts,
        totalSales,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        hasStore: seller.store.length > 0,
        createdAt: seller.createdAt,
      };
    }),
  );

  // Apply store filter
  if (storeFilter === 'hasStore') {
    sellerStats = sellerStats.filter(seller => seller.hasStore === true);
  } else if (storeFilter === 'noStore') {
    sellerStats = sellerStats.filter(seller => seller.hasStore === false);
  }

  // Apply sorting
  switch (sortBy) {
    case 'newest':
      sellerStats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'oldest':
      sellerStats.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'nameAsc':
      sellerStats.sort((a, b) => a.fullName.localeCompare(b.fullName));
      break;
    case 'nameDesc':
      sellerStats.sort((a, b) => b.fullName.localeCompare(a.fullName));
      break;
    case 'salesHigh':
      sellerStats.sort((a, b) => b.totalSales - a.totalSales);
      break;
    case 'salesLow':
      sellerStats.sort((a, b) => a.totalSales - b.totalSales);
      break;
    case 'revenueHigh':
      sellerStats.sort((a, b) => b.totalRevenue - a.totalRevenue);
      break;
    case 'revenueLow':
      sellerStats.sort((a, b) => a.totalRevenue - b.totalRevenue);
      break;
    default:
      sellerStats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Apply pagination after sorting
  const totalSeller = sellerStats.length;
  const paginatedData = sellerStats.slice(skip, skip + limit);

  return {
    meta: {
      page,
      limit,
      total: totalSeller,
      totalPage: Math.ceil(totalSeller / limit),
    },
    data: paginatedData,
  };
};

  const getAllProducts = async (
    sellerId: string,
    options: IPaginationOptions,
  ) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);

    const sellerInfo = await prisma.user.findUnique({
      where: {
        id: sellerId,
        role: "SELLER",
      },
      include: {
        store: true,
      },
    });

    if (!sellerInfo) {
      throw new Error("Seller not found");
    }

    const products = await prisma.product.findMany({
      where: {
        shop: {
          sellerId,
        },
      },
      skip: skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const productStats = await Promise.all(
      products.map(async (product) => {
        const orders = await prisma.order.findMany({
          where: {
            variant: {
              productId: product.id,
            },
          },
          select: {
            quantity: true,
            price: true,
          },
        });

        const totalSales = orders.reduce((sum, o) => sum + o.quantity, 0);
        const totalRevenue = orders.reduce(
          (sum, o) => sum + o.price * o.quantity,
          0,
        );

        return {
          id: product.id,
          totalSales,
          totalRevenue,
          productName: product.productName,
          productPhoto: product.productPhoto,
          basePrice: product.basePrice,
          createdAt: product.createdAt,
        };
      }),
    );

    const totalProduct = await prisma.product.count({
      where: {
        shop: {
          sellerId,
        },
      },
    });

    return {
      meta: {
        page,
        limit,
        total: totalProduct,
        totalPage: Math.ceil(totalProduct / limit),
      },
      data: {
        sellerInfo,
        productList: productStats,
      },
    };
  };

  // seller performance monitor page

  const sellerPerformanceData = async (sellerId: string) => {
    const totalProducts = await prisma.product.count({
      where: {
        shop: {
          sellerId,
        },
        isDeleted: false,
        isPublished: true,
      },
    });

    const totalOrders = await prisma.order.findMany({
      where: {
        store: {
          sellerId,
        },
        isPaid: true,
      },
    });

    const totalOrder = totalOrders.length;

    const newOrder = totalOrders.filter(
      (order) => order.orderStatus === "Pending",
    ).length;

    const cancelledOrder = totalOrders.filter(
      (order) => order.orderStatus === "Rejected",
    ).length;

    // Returned functionality is not set
    // const returnedOrder = totalOrders.filter((order) => order.orderStatus === "Returned").length;

    const processedOrder = totalOrders.filter(
      (order) => order.orderStatus === "Accepted" || order.orderStatus === "Shipped",
    ).length;

    const deliveredOrder = totalOrders.filter(
      (order) => order.orderStatus === "Delivered",
    ).length;
    
    return {
      totalProducts,
      totalOrder,
      newOrder,
      cancelledOrder,
      processedOrder,
      deliveredOrder,
    };
  };

  const getOrderTableData = async (
    sellerId: string,
    options: IPaginationOptions & { filter?: number },
  ) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { filter } = options;

    const whereCondition: any = {
      store: {
        sellerId,
      },
      isPaid: true,
    };

    if (filter) {
      const startOfYear = new Date(filter, 0, 1);
      const endOfYear = new Date(filter + 1, 0, 1);

      whereCondition.createdAt = {
        gte: startOfYear,
        lt: endOfYear,
      };
    }

    const orders = await prisma.order.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        orderStatus: true,
        createdAt: true,
        id: true,
        orderNumber: true,
        deliveryAddress: true,
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });

    const total = await prisma.order.count({ where: whereCondition });

    const totalStore = await prisma.store.count({
      where: {
        sellerId,
        status: "Approved"
      }, 
    });

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      totalOrder: total,
      totalStore,
      data: orders,
    };
  };

  const sellInsightChartData = async (
    sellerId: string,
    options: { filter?: string },
  ) => {
    const filterQuery = options.filter || new Date().getFullYear();

    const year = parseInt(filterQuery as string);
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const orders = await prisma.order.findMany({
      where: {
        store: {
          sellerId,
        },
        isPaid: true,
        createdAt: { gte: startOfYear, lt: endOfYear },
      },
      select: { price: true, quantity: true, createdAt: true },
    });

    const revenueByMonth: Record<string, number> = {};

    orders.forEach((order) => {
      const month = new Date(order.createdAt).toLocaleString("default", {
        month: "short",
      });
      revenueByMonth[month] =
        (revenueByMonth[month] || 0) + order.price * order.quantity;
    });

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const data = months.map((month) => ({
      month,
      revenue: revenueByMonth[month] || 0,
    }));

    return { year, data };
  };

  // Get Sell by regional percentage Chart data
  const getSalesInsightsByRegion = async () => {
    const orders = await prisma.order.findMany({
      select: { region: true },
    });

    const regions = [
      "Asia",
      "Europe",
      "North America",
      "South America",
      "Africa",
      "Oceania",
      "Middle East",
      "Other",
    ];

    const regionCount: Record<string, number> = {};
    regions.forEach((r) => (regionCount[r] = 0));

    for (const order of orders) {
      const region = order.region || "Other";
      if (regionCount[region] !== undefined) {
        regionCount[region]++;
      } else {
        regionCount["Other"]++;
      }
    }

    const total = Object.values(regionCount).reduce((a, b) => a + b, 0);

    const chartData = Object.entries(regionCount).map(([region, count]) => ({
      name: region,
      value: total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0,
    }));

    return chartData;
  };


  const getAllOrderList = async (options: IPaginationOptions) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);

    const orders = await prisma.order.findMany({
      skip: skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        quantity: true,
        currency: true,
        orderStatus: true,
        orderNumber: true,
        deliveryAddress: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
          },
        },
        variant: {
          select: {
            product: {
              select: {
                id: true,
                productName: true,
                productPhoto: true
              },
            },
          },
        }
      }
    });

    const total = await prisma.order.count();

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: orders,
    };
  };

 





 
export interface ISellerSubscriptionFilters {
  startDate?: string;
  endDate?: string;
  status?: SubscriptionStatus | 'ALL';
}
 
 

// Main Service Function
const getAllSellerSubscriptions = async (
  options: IPaginationOptions & ISellerSubscriptionFilters
) => {
  const {
    page = 1,
    limit = 10,
    startDate,
    endDate,
    status = 'ALL',
  } = options;

  const skip = (page - 1) * limit;

  // Build where conditions
  const whereCondition: any = {
    subscription: {
      isNot: null,
    },
    user: {
      role: {
        in: ['SELLER', 'ALL'],
      },
      isDeleted: false,
    },
  };

  // Filter by status
  if (status !== 'ALL') {
    whereCondition.status = status;
  }

  // Date range filter
  if (startDate && endDate) {
    whereCondition.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  } else if (startDate) {
    whereCondition.createdAt = {
      gte: new Date(startDate),
    };
  } else if (endDate) {
    whereCondition.createdAt = {
      lte: new Date(endDate),
    };
  }

  // Get total count
  const total = await prisma.userSubscription.count({
    where: whereCondition,
  });

  // Get paginated data
  const subscriptions = await prisma.userSubscription.findMany({
    where: whereCondition,
    skip: skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        include: {
          store: {
            take: 1,
          },
        },
      },
      subscription: true,
    },
  });

  // Format response data
  const formattedData = subscriptions.map((sub) => {
    const store = sub.user?.store?.[0] || null;
    
    return {
      id: sub.id,
      sellerId: sub.userId,
      sellerName: sub.user?.fullName || 'Unknown Seller',
      sellerEmail: sub.user?.email || '',
      sellerProfileImage: sub.user?.profileImage || '',
      plan: sub.subscription?.type || SubscriptionType.FREE,
      planName: sub.subscription?.title || 'Free Plan',
      purchaseDate: sub.createdAt,
      renewDate: sub.endDate || sub.createdAt,
      endDate: sub.endDate || new Date(),
      status: sub.status,
      price: sub.subscription?.price || 0, 
      interval: sub.subscription?.interval || IntervalType.month,
      intervalCount: sub.subscription?.interval_count || 1,
      storeId: store?.id || undefined,
      storeName: store?.shopName || undefined,
      paymentId: sub.subscriptionPayId || undefined,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    };
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: formattedData,
  };
};




  export const adminDashboardService = {
    getAllSellerList,
    getAllProducts,
    sellerPerformanceData,
    getOrderTableData,
    sellInsightChartData,
    getSalesInsightsByRegion,
    getAllOrderList,
    getAllSellerSubscriptions
  };
