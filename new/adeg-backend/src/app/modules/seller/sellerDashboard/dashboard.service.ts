import httpStatus from "http-status";
import ApiError from "../../../../errors/ApiErrors";
import prisma from "../../../../shared/prisma";
import { getWeekOfMonth, getYear } from "date-fns";

const getSellerDashboardData = async (sellerId: string) => {
  const sellerInfo = await prisma.user.findUnique({
    where: {
      id: sellerId,
      role: {
        in: ["SELLER", "ALL"],
      },
    },
  });

  if (!sellerInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, "Seller not found");
  }

  const totalProduct = await prisma.product.count({
    where: {
      shop: {
        sellerId,
      },
    },
  });

  const orders = await prisma.order.findMany({
    where: {
      store: {
        sellerId,
      },
    },
    select: {
      id: true,
      orderStatus: true,
      price: true,
      createdAt: true,
      quantity: true,
      variant: {
        select: {
          id: true,
          product: {
            select: {
              id: true,
              productName: true,
              productPhoto: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalOrder = orders.length;

  const totalRevenue = orders.reduce((sum, o) => sum + o.price * o.quantity, 0);

  const getFirstTenOrder = orders.slice(0, 10);

  return {
    totalProduct,
    totalOrder,
    totalRevenue: totalRevenue.toFixed(2),
    orders: getFirstTenOrder,
  };
};

const getSellerSalesAnalytics = async (
  sellerId: string,
  options: { filter?: "week" | "month" | "year" } = {},
) => {
  const filter = options.filter || "month";

  const orders = await prisma.order.findMany({
    where: { store: { sellerId } },
    select: { price: true, quantity: true, createdAt: true },
  });

  const revenueByPeriod: Record<string, number> = {};

  orders.forEach((order) => {
    const d = new Date(order.createdAt);
    let key = "";

    if (filter === "week") {
      const weekNumber = Math.ceil(
        (d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7,
      );
      key = `W${weekNumber}`;
    } else if (filter === "month") {
      key = d.toLocaleString("default", { month: "short" });
    } else if (filter === "year") {
      key = d.getFullYear().toString();
    }

    revenueByPeriod[key] =
      (revenueByPeriod[key] || 0) + order.price * order.quantity;
  });

  let periods: string[] = [];
  if (filter === "week") periods = ["W1", "W2", "W3", "W4"];
  else if (filter === "month")
    periods = [
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
  else if (filter === "year") {
    const currentYear = new Date().getFullYear();
    periods = Array.from({ length: 5 }, (_, i) =>
      (currentYear - 4 + i).toString(),
    );
  }

  const data = periods.map((period) => ({
    day: period,
    value: revenueByPeriod[period] || 0,
  }));

  return { data };
};

const getSellerPaymentData = async (
  sellerId: string,
  options: {
    search?: string;
    filter?: "today" | "week" | "month" | "year";
  },
) => {
  const { search, filter } = options;

  if (!sellerId) throw new Error("sellerId is required");

  let dateFilter: any = {};
  const now = new Date();

  if (filter === "today") {
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));
    dateFilter = { gte: start, lte: end };
  } else if (filter === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    dateFilter = { gte: start, lte: end };
  } else if (filter === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    dateFilter = { gte: start, lte: end };
  } else if (filter === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    dateFilter = { gte: start, lte: end };
  }

  const paymentWhere: any = {
    ...(search && {
      paymentIntentId: { contains: search, mode: "insensitive" },
    }),
    ...(filter && { createdAt: dateFilter }),
    Order: {
      some: {
        store: { sellerId },
      },
    },
  };

  const payments = await prisma.payment.findMany({
    where: paymentWhere,
    include: {
      Order: {
        where: { store: { sellerId } },
        select: { price: true, quantity: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const paymentData = payments.map((payment) => ({
    id: payment.id,
    paymentIntentId: payment.paymentIntentId,
    createdAt: payment.createdAt,
    amount: payment.Order.reduce((sum, o) => sum + o.price * o.quantity, 0),
  }));

  const totalProduct = await prisma.product.count({
    where: { shop: { sellerId } },
  });

  const orders = await prisma.order.findMany({
    where: {
      store: { sellerId },
    },
    select: {
      price: true,
      quantity: true,
      orderStatus: true,
      payment: {
        select: {
          id: true,
          createdAt: true,
          paymentIntentId: true,
        },
      },
    },
  });

  const newOrder = orders.filter((o) => o.orderStatus === "Pending").length;

  const totalRevenue = orders.reduce((sum, o) => sum + o.price * o.quantity, 0);

  return {
    totalProduct,
    newOrder,
    totalRevenue,
    // totalTransactions: paymentData.length,
    paymentData,
  };
};

const getSellerRevenueAnalytics = async (
  sellerId: string,
  options: { filter?: "week" | "month" | "year" },
) => {
  const now = new Date();

  const filter = options.filter || "month";

  const payments = await prisma.payment.findMany({
    where: {
      Order: {
        some: {
          store: {
            sellerId,
          },
        },
      },
    },
    include: {
      Order: {
        where: {
          store: { sellerId },
        },
        select: {
          price: true,
          quantity: true,
          createdAt: true,
        },
      },
    },
  });

  // Group revenue based on filter type
  const revenueByPeriod: Record<string, number> = {};

  for (const payment of payments) {
    for (const order of payment.Order) {
      const orderDate = new Date(order.createdAt);

      let key = "";
      if (filter === "week") {
        key = `W${getWeekOfMonth(orderDate)}`;
      } else if (filter === "month") {
        key = orderDate.toLocaleString("default", { month: "short" }); // Jan, Feb, etc.
      } else if (filter === "year") {
        key = getYear(orderDate).toString();
      }

      const revenue = order.price * order.quantity;
      revenueByPeriod[key] = (revenueByPeriod[key] || 0) + revenue;
    }
  }

  // Build chart data structure
  let periods: string[] = [];
  if (filter === "week") {
    periods = ["W1", "W2", "W3", "W4"];
  } else if (filter === "month") {
    periods = [
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
  } else if (filter === "year") {
    const currentYear = getYear(now);
    periods = Array.from({ length: 5 }, (_, i) =>
      (currentYear - 4 + i).toString(),
    );
  }

  const chartData = periods.map((period) => ({
    period,
    baseline: 45,
    revenue: revenueByPeriod[period] || 0,
  }));

  return chartData;
};

export const createShippingOptions = async (payload: any) => {
  const {
    shippingZone,
    freeShippingZone,
    storeId,
    insideCityRate,
    outsideCityRate,
    // freeAreaRate,
    isFreeShippingEnabled
    // shippingRates = [],
    // logisticsPartners = [],
  } = payload;

  const shippingOption = await prisma.shippingOption.upsert({
    where: { storeId },
    update: {
      shippingZone,
      freeShippingZone,
      storeId,
      insideCityRate,
      outsideCityRate,
      isFreeShippingEnabled
    },
    create: {
      shippingZone,
      freeShippingZone,
      storeId,
      insideCityRate,
      outsideCityRate,
      isFreeShippingEnabled,
    },
  });

  return shippingOption;

  //   try {
  //     const result = await prisma.$transaction(async (tx) => {
  //       const newShippingOption = await tx.shippingOption.create({
  //         data: {
  //           shippingZone,
  //           freeShippingZone,
  //           storeId,
  //         },
  //       });

  //       if (shippingRates.length > 0) {
  //         await tx.shippingRate.createMany({
  //           data: shippingRates.map((rate: any) => ({
  //             packageName: rate.packageName,
  //             packageDescription: rate.packageDescription,
  //             packagePrice: rate.packagePrice,
  //             shippingOptionId: newShippingOption.id,
  //           })),
  //         });
  //       }

  //       if (logisticsPartners.length > 0) {
  //         await tx.logisticsPartner.createMany({
  //           data: logisticsPartners.map((partner: any) => ({
  //             logo: partner.logo,
  //             currierName: partner.currierName,
  //             shippingZone: partner.shippingZone,
  //             areaRates: partner.areaRates,
  //             deliveryTime: partner.deliveryTime,
  //             shippingOptionId: newShippingOption.id,
  //           })),
  //         });
  //       }

  //       return newShippingOption;
  //     });

  //     return {
  //       success: true,
  //       message: "Shipping Option created successfully",
  //       data: result,
  //     };
  //   } catch (error: any) {
  //     console.error("Error creating shipping options:", error);
  //     return {
  //       success: false,
  //       message: error.message || "Failed to create shipping option",
  //     };
  //   }
};

const getShoppingOptionsByStoreId = async (storeId: string) => {
  const shippingOptions = await prisma.shippingOption.findMany({
    where: { storeId },
    // include: {
    //   shippingRates: true,
    //   logisticsPartners: true,
    // },
  });

  return shippingOptions;
};

export const sellerDashboardService = {
  getSellerDashboardData,
  getSellerSalesAnalytics,
  getSellerPaymentData,
  getSellerRevenueAnalytics,
  createShippingOptions,
  getShoppingOptionsByStoreId,
};
