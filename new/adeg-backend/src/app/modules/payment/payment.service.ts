import httpStatus from "http-status";
import { notificationServices } from "../notifications/notification.service";
import axios from "axios";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { stripe } from "../../../utlits/stripe";
import { nanoid } from "nanoid/non-secure";
import { OrderEnum, PaymentStatus, UserRole } from "@prisma/client";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../shared/pagination";

type CreateOrderPayload = {
  storeId?: string;
  variantId?: string;
  bundleId?: string;
  price: number;
  deliveryFee: number;
  quantity: number;
};

type CreatePaymentPayload = {
  orders: CreateOrderPayload[];
  currency?: string;
  deliveryAddress?: string;
  phoneNumber?: string;
  name?: string;
  paymentMethod: "stripe" | "paystack";
  zipCode?: string;
  city?: string;
  country?: string;
  state?: string;
  region?: string;
  totalAmount: number;
  taxAmount?: number;
};

const generateOrderNumber = () => `ORD-${nanoid(8).toUpperCase()}`;


const roundAmount = (value: number) => Number(value.toFixed(2));

const buildFullDeliveryAddress = (payload: {
  deliveryAddress?: string | null;
  city?: string | null;
  state?: string | null;
  region?: string | null;
  country?: string | null;
  zipCode?: string | null;
  phoneNumber?: string | null;
}) => {
  return [
    payload.deliveryAddress,
    payload.city,
    payload.state || payload.region,
    payload.country,
    payload.zipCode,
    payload.phoneNumber,
  ]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join(", ");
};

const getPaymentBreakdown = (
  items: Array<{
    price: number;
    quantity: number;
    deliveryFee?: number | null;
  }>,
  paymentAmount?: number | null,
) => {
  const subtotal = roundAmount(
    items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    ),
  );

  const deliveryFee = roundAmount(
    items.reduce((sum, item) => sum + Number(item.deliveryFee || 0), 0),
  );

  const baseTotal = roundAmount(subtotal + deliveryFee);
  const processingFee = roundAmount(
    Math.max(Number(paymentAmount ?? baseTotal) - baseTotal, 0),
  );
  const totalPayment = roundAmount(baseTotal + processingFee);

  return {
    subtotal,
    deliveryFee,
    processingFee,
    totalPayment,
  };
};

const createPayment = async (userId: string, payload: CreatePaymentPayload) => {
  if (!payload.orders || payload.orders.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Orders are required");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  const subtotal = payload.orders.reduce(
    (sum, o) => sum + o.price * o.quantity,
    0,
  );

  const totalDeliveryFee = payload.orders.reduce(
    (sum, o) => sum + (o.deliveryFee || 0),
    0,
  );

  const taxAmount = payload.taxAmount || 0;

  let totalAmount = subtotal + totalDeliveryFee + taxAmount;

  let currency = (payload.currency || "usd").toLowerCase();

  // Create payment record first
  const payment = await prisma.payment.create({
    data: {
      amount: totalAmount,
      status: PaymentStatus.Pending,
    },
  });

  // Create all related orders
  const orders = await Promise.all(
    payload.orders.map((order) =>
      prisma.order.create({
        data: {
          userId,
          storeId: order.storeId,
          currency: currency.toUpperCase(),
          variantId: order.variantId,
          bundleId: order.bundleId,
          phoneNumber: payload.phoneNumber || user.phoneNumber,
          deliveryAddress: payload.deliveryAddress,
          name: payload?.name,
          zipCode: payload.zipCode,
          city: payload.city,
          country: payload?.country,
          state: payload.state,
          region: payload.region,
          orderNumber: generateOrderNumber(),
          price: order.price,
          deliveryFee: order.deliveryFee,
          quantity: order.quantity,
          paymentId: payment.id,
        },
      }),
    ),
  );

  //remove items from cart after order is placed
  await Promise.all(
    payload.orders.map((order) =>
      prisma.cart.deleteMany({
        where: {
          userId,
          variantId: order.variantId,
        },
      }),
    ),
  );

  // ------------------------------
  // ✅ STRIPE PAYMENT FLOW
  // ------------------------------
  if (payload.paymentMethod === "stripe") {
    if (currency !== "usd") {
      const { data } = await axios.get(
        "https://v6.exchangerate-api.com/v6/b48de84dee502dcf3157a1e5/latest/USD",
      );

      let upperCurrency = currency.toUpperCase();
      const rate = data?.conversion_rates?.[upperCurrency];

      if (!rate) throw new ApiError(httpStatus.BAD_REQUEST, "Invalid currency");

      totalAmount = totalAmount * rate;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: "Order Payment",
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        paymentId: payment.id,
        userId,
        orderIds: orders.map((o) => o.id).join(","),
      },
      success_url: `https://api.sellapy.com/payment-success?paymentId=${payment.id}`,
      cancel_url: `https://api.sellapy.com/payment-cancel`,
    });

    return {
      paymentId: payment.id,
      checkoutUrl: session.url,
      gateway: "stripe",
    };
  }

  // ------------------------------
  // ✅ PAYSTACK PAYMENT FLOW
  // ------------------------------
  else if (payload.paymentMethod === "paystack") {
    let paystackCurrency = currency;

    // ⚡ Convert USD → ZAR automatically
    let convertedAmount = totalAmount;
    // if (currency === "usd") {
    //   try {
    //     const { data } = await axios.get(
    //       "https://api.exchangerate.host/convert?from=USD&to=ZAR",
    //     );
    //     const rate = data?.info?.rate || 18; // fallback rate if API fails
    //     convertedAmount = totalAmount * rate;
    //     paystackCurrency = "zar";
    //     console.log(
    //       `Converted ${totalAmount} USD → ${convertedAmount.toFixed(2)} ZAR (Rate: ${rate})`,
    //     );
    //   }
    if (currency === "usd") {
      try {
        const { data } = await axios.get(
          "https://v6.exchangerate-api.com/v6/b48de84dee502dcf3157a1e5/latest/USD",
        );

        const rate = data?.conversion_rates?.NGN || 1500;
        convertedAmount = totalAmount * rate;
        paystackCurrency = "ngn";

        console.log(
          `Converted ${totalAmount} USD → ${convertedAmount.toFixed(2)} NGN (Rate: ${rate})`,
        );
      } catch (error) {
        console.error(
          "Currency conversion failed, using fallback rate (1500 NGN/USD)",
        );
        convertedAmount = totalAmount * 1500;
        paystackCurrency = "ngn";

        // For ZAR conversion
        // convertedAmount = totalAmount * 18;
        // paystackCurrency = "zar";
      }
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: Math.round(convertedAmount * 100), // Paystack expects amount in kobo/cents
        currency: paystackCurrency.toUpperCase(),
        metadata: {
          paymentId: payment.id,
          userId,
          orderIds: orders.map((o) => o.id).join(","),
        },
        callback_url: `https://api.sellapy.com/payment-success?paymentId=${payment.id}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      paymentId: payment.id,
      checkoutUrl: response.data.data.authorization_url,
      gateway: "paystack",
      convertedAmount,
      paystackCurrency,
    };
  }

  throw new ApiError(httpStatus.BAD_REQUEST, "Invalid payment method");
};

const handlePaymentSuccess = async (paymentId: string) => {
  // const session = await stripe.checkout.sessions.retrieve(sessionId);

  // if (session.payment_status !== "paid") {
  //   throw new Error("Payment not completed");
  // }

  return prisma.payment.update({
    where: {
      id: paymentId,
    },
    data: {
      isPaid: true,
    },
  });
};

const getCustomerSavedCardsFromStripe = async (customerId: string) => {
  try {
    // List all payment methods for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    // Extract only the last4 digits from each payment method
    const cards = paymentMethods.data.map((card) => ({
      last4: card.card?.last4,
      brand: card.card?.brand,
      paymentMethodsId: card.id,
    }));

    return cards;
  } catch (error: any) {
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
};

// Delete a card from a customer in the stripe
const deleteCardFromCustomer = async (paymentMethodId: string) => {
  try {
    await stripe.paymentMethods.detach(paymentMethodId);
    return { message: "Card deleted successfully" };
  } catch (error: any) {
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
};

// Refund amount to customer in the stripe
const refundPaymentToCustomer = async (payload: {
  paymentIntentId: string;
}) => {
  try {
    // Refund the payment intent
    const refund = await stripe.refunds.create({
      payment_intent: payload?.paymentIntentId,
    });

    return refund;
  } catch (error: any) {
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
};

const getMyTotalEarnings = async (sellerId: string) => {
  const stores = await prisma.store.findFirst({
    where: { sellerId },
    select: { id: true },
  });

  const totalWithdrawals = await prisma.withdraw.aggregate({
    where: { sellerId, status: "Approved" },
    _sum: { amount: true },
  });

  let orders: Array<{
    price: number;
    quantity: number;
    currency: string;
    deliveryFee: number;
  }> = [];

  if (stores?.id) {
    orders = await prisma.order.findMany({
      where: {
        storeId: stores?.id,
        orderStatus: "Delivered",
        isPaid: true,
      },
      select: {
        price: true,
        quantity: true,
        currency: true,
        deliveryFee: true,
      },
    });
  }

  if (orders.length === 0) {
    return {
      totalEarningsUSD: 0,
      totalEarningsNGN: 0,
      totalWithdrawals: totalWithdrawals._sum.amount || 0,
    };
  }

  const totalEarningsUSD = orders.reduce((sum, order) => {
    const orderTotal = order.price * order.quantity;
    const deliveryFee = order.deliveryFee || 0;
    return sum + orderTotal + deliveryFee;
  }, 0);

  const { data } = await axios.get(
    "https://v6.exchangerate-api.com/v6/b48de84dee502dcf3157a1e5/latest/USD",
  );

  const rate = data?.conversion_rates?.NGN || 1500;

  const totalEarningsNGN = totalEarningsUSD * rate;

  return {
    totalEarningsUSD: totalEarningsUSD || 0,
    totalEarningsNGN: totalEarningsNGN || 0,
    totalWithdrawals: totalWithdrawals._sum.amount || 0,
  };
};

const getAllWithdrawRequests = async (
  userId: string,
  options: IPaginationOptions & { search?: string },
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const { search } = options;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const isAdmin =
    user.role === UserRole.ADMIN || user.role === UserRole.SUB_ADMIN;

  const whereCondition: any = {};

  if (!isAdmin) {
    whereCondition.sellerId = userId;
  }

  if (search) {
    whereCondition.OR = [
      { bankName: { contains: search, mode: "insensitive" } },
      { accountNo: { contains: search, mode: "insensitive" } },
      { accountName: { contains: search, mode: "insensitive" } },
      { seller: { fullName: { contains: search, mode: "insensitive" } } },
      { seller: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const requests = await prisma.withdraw.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
    select: {
      id: true,
      sellerId: true,
      amount: true,
      bankName: true,
      accountNo: true,
      accountName: true,
      sortCode: true,
      createdAt: true,
      status: true,
      seller: {
        select: {
          fullName: true,
          email: true,
          phoneNumber: true,
          profileImage: true,
        },
      },
    },
  });

  const total = await prisma.withdraw.count({ where: whereCondition });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: requests,
  };
};

const withdrawRequest = async (
  sellerId: string,
  payload: {
    amount: number;
    bankName: string;
    accountNo: string;
    accountName: string;
    sortCode: string;
  },
) => {
  const totalWithdrawals = await prisma.withdraw.aggregate({
    where: { sellerId, status: "Approved" },
    _sum: { amount: true },
  });

  const earnings = await getMyTotalEarnings(sellerId);

  const availableBalance = (((earnings && earnings.totalEarningsUSD) || 0) -
    (totalWithdrawals._sum.amount || 0)) as number;
  if (availableBalance < payload.amount) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }

  const payment = await prisma.withdraw.create({
    data: {
      sellerId,
      amount: payload.amount,
      bankName: payload.bankName,
      accountNo: payload.accountNo,
      accountName: payload.accountName,
      sortCode: payload.sortCode,
    },
  });
  return payment;
};

const updateRequestStatus = async (
  withdrawId: string,
  status: "Pending" | "Approved" | "Rejected",
) => {
  const request = await prisma.withdraw.findUnique({
    where: { id: withdrawId },
  });
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, "Withdraw request not found");
  }
  if (request.status !== "Pending") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Only pending requests can be updated",
    );
  }
  const updatedRequest = await prisma.withdraw.update({
    where: { id: withdrawId },
    data: { status },
  });
  if (status === "Approved") {
    await prisma.store.update({
      where: { sellerId: request.sellerId },
      data: { totalWithdraw: { increment: request.amount } },
    });
    // // Send notification to user
    // await notificationServices.createNotification({
    //   id: request.sellerId,
    //   message: "Your withdraw request has been approved",
    //   type: "Withdraw",
    // });
  }
  return updatedRequest;
};

const updateOrderStatus = async (orderId: string, status: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      variant: {
        select: {
          product: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: status as OrderEnum },
  });

  if (status === "Shipped") {
    await prisma.user.update({
      where: { id: order.userId as string },
      data: { rewardPoint: { increment: order.quantity } },
    });
  }

  if (status === "Delivered" && order?.variant?.product.id) {
    await prisma.product.update({
      where: { id: order?.variant?.product.id },
      data: {
        totalSale: { increment: order.quantity },
      },
    });
  }

  let buyerId = order.userId || updatedOrder.userId as string;
  console.log("Buyer ID:", buyerId);

  try {
    await notificationServices.sendSingleNotification({
      id: buyerId,
      body: `Your order ${updatedOrder.orderNumber} is now ${status}`,
      title: `Order status ${status}`,
    });
  } catch (error) {
    console.log("Failed to send notification:", error);
  }

  return updatedOrder;
};

const getOrderDetails = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      payment: {
        select: {
          id: true,
          amount: true,
          status: true,
          isPaid: true,
          createdAt: true,
        },
      },
      store: {
        select: {
          id: true,
          shopName: true,
          shopLogo: true,
          seller: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              profileImage: true,
            },
          },
        },
      },
      variant: {
        select: {
          id: true,
          sku: true,
          price: true,
          product: {
            select: {
              id: true,
              productName: true,
              productPhoto: true,
            },
          },
        },
      },
      user: {
        select: {
          fullName: true,
          email: true,
          phoneNumber: true,
          deliveryAddress: true,
          location: true,
          city: true,
          state: true,
          zipCode: true,
        },
      },
    },
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  const invoiceOrders = await prisma.order.findMany({
    where: {
      paymentId: order.paymentId,
      isPaid: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      orderNumber: true,
      price: true,
      quantity: true,
      deliveryFee: true,
      currency: true,
      createdAt: true,
      variant: {
        select: {
          id: true,
          sku: true,
          product: {
            select: {
              id: true,
              productName: true,
              productPhoto: true,
            },
          },
        },
      },
      bundle: {
        select: {
          id: true,
          bundleTag: true,
          quantity: true,
          discount: true,
        },
      },
    },
  });

  const payment = await prisma.payment.findUnique({
    where: { id: order.paymentId },
  });

  const invoiceBreakdown = getPaymentBreakdown(
    invoiceOrders.map((item) => ({
      price: item.price,
      quantity: item.quantity,
      deliveryFee: item.deliveryFee,
    })),
    payment?.amount || 0,
  );

  const deliveryDetails = {
    phoneNumber:
      order.phoneNumber || (order.user?.phoneNumber as string | null) || null,
    deliveryAddress:
      order.deliveryAddress ||
      (order.user?.deliveryAddress as string | null) ||
      null,
    city: order.city || (order.user?.city as string | null) || null,
    state: order.state || (order.user?.state as string | null) || null,
    region: order.region || null,
    country: order.country || (order.user?.location as string | null) || null,
    zipCode: order.zipCode || (order.user?.zipCode as string | null) || null,
  };

  const fullDeliveryAddress = buildFullDeliveryAddress(deliveryDetails);

  return {
    ...order,
    deliveryDetails: {
      ...deliveryDetails,
      fullDeliveryAddress,
    },
    invoice: {
      invoiceNumber: order.paymentId,
      paymentId: order.paymentId,
      paymentDate: payment?.createdAt || order.createdAt,
      currency: order.currency,
      items: invoiceOrders.map((item) => ({
        id: item.id,
        orderNumber: item.orderNumber,
        productId: item.variant?.product?.id || null,
        productName: item.variant?.product?.productName || null,
        productPhoto: item.variant?.product?.productPhoto || [],
        variantId: item.variant?.id || null,
        sku: item.variant?.sku || null,
        bundle: item.bundle || null,
        unitPrice: item.price,
        quantity: item.quantity,
        itemSubtotal: roundAmount(item.price * item.quantity),
        deliveryFee: roundAmount(item.deliveryFee || 0),
      })),
      summary: invoiceBreakdown,
    },
  };
};

const getMyOrders = async (userId: string, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const isExistUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      store: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!isExistUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const whereCondition: any = {};

  // if (
  //   isExistUser.role === UserRole.SELLER ||
  //   isExistUser.role === UserRole.ALL
  // ) {
  //   whereCondition.storeId = { in: isExistUser.store.map((store) => store.id) };
  // } else {
  //   whereCondition.userId = userId;
  // }

  if (userId) {
    whereCondition.userId = userId;
  }

  // console.dir(whereCondition, { depth: null });

  const orders = await prisma.order.findMany({
    where: { ...whereCondition, isPaid: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      paymentId: true,
      orderNumber: true,
      price: true,
      deliveryFee: true,
      quantity: true,
      currency: true,
      phoneNumber: true,
      zipCode: true,
      city: true,
      country: true,
      state: true,
      region: true,
      deliveryAddress: true,
      createdAt: true,
      orderStatus: true,
      isReviewed: true,
      payment: {
        select: {
          id: true,
          amount: true,
          status: true,
          isPaid: true,
        },
      },
      variant: {
        select: {
          id: true,
          sku: true,
          product: {
            select: { id: true, productName: true, productPhoto: true },
          },
        },
      },
      store: {
        select: {
          seller: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              profileImage: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
          email: true,
          phoneNumber: true,
          deliveryAddress: true,
          city: true,
          state: true,
          zipCode: true,
        },
      },
    },
    skip,
    take: limit,
  });

  const paymentIds = Array.from(
    new Set(orders.map((order) => order.paymentId).filter(Boolean)),
  );

  const siblingOrders = paymentIds.length
    ? await prisma.order.findMany({
      where: {
        paymentId: { in: paymentIds },
        isPaid: true,
      },
      select: {
        id: true,
        paymentId: true,
        price: true,
        quantity: true,
        deliveryFee: true,
      },
    })
    : [];

  const paymentBreakdownMap = new Map<
    string,
    ReturnType<typeof getPaymentBreakdown> & { baseTotal: number }
  >();

  paymentIds.forEach((paymentId) => {
    const paymentOrders = siblingOrders.filter(
      (item) => item.paymentId === paymentId,
    );
    const currentOrder = orders.find((item) => item.paymentId === paymentId);
    const breakdown = getPaymentBreakdown(
      paymentOrders.map((item) => ({
        price: item.price,
        quantity: item.quantity,
        deliveryFee: item.deliveryFee,
      })),
      currentOrder?.payment?.amount,
    );

    paymentBreakdownMap.set(paymentId, {
      ...breakdown,
      baseTotal: roundAmount(breakdown.subtotal + breakdown.deliveryFee),
    });
  });

  const formattedOrders = orders.map((order) => {
    const itemSubtotal = roundAmount(order.price * order.quantity);
    const deliveryFee = roundAmount(order.deliveryFee || 0);
    const shareBase = roundAmount(itemSubtotal + deliveryFee);
    const paymentBreakdown = paymentBreakdownMap.get(order.paymentId);
    const processingFee =
      paymentBreakdown && paymentBreakdown.baseTotal > 0
        ? roundAmount(
          (paymentBreakdown.processingFee * shareBase) /
          paymentBreakdown.baseTotal,
        )
        : 0;

    const deliveryDetails = {
      phoneNumber: order.phoneNumber || order.user?.phoneNumber || null,
      deliveryAddress:
        order.deliveryAddress || order.user?.deliveryAddress || null,
      city: order.city || order.user?.city || null,
      state: order.state || order.user?.state || null,
      region: order.region || null,
      country: order.country || null,
      zipCode: order.zipCode || order.user?.zipCode || null,
    };

    return {
      ...order,
      deliveryDetails: {
        ...deliveryDetails,
        fullDeliveryAddress: buildFullDeliveryAddress(deliveryDetails),
      },
      invoiceSummary: {
        itemSubtotal,
        deliveryFee,
        processingFee,
        totalPayment: roundAmount(shareBase + processingFee),
      },
    };
  });

  const total = await prisma.order.count({ where: whereCondition });
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: formattedOrders,
  };
};

const getMyStoreOrders = async (userId: string, options: IPaginationOptions & {
  searchTerm?: string;
  orderStatus?: OrderEnum;
  sortByDate?: "newest" | "oldest"; 
  fromDate?: Date;
  toDate?: Date;
}) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);


  const {
    searchTerm,
    orderStatus,
    sortByDate,
    fromDate,
    toDate,
  } = options;



  const isExistUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      store: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!isExistUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const whereCondition: any = {
    isPaid: true,
  };


  whereCondition.storeId = { in: isExistUser.store.map((store) => store.id) };

  if (searchTerm) {
    whereCondition.OR = [
      {
        orderNumber: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        phoneNumber: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        user: {
          fullName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
      {
        user: {
          email: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
      {
        variant: {
          product: {
            productName: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  if (orderStatus) {
    whereCondition.orderStatus = orderStatus;
  }

  if (fromDate || toDate) {
    whereCondition.createdAt = {};

    if (fromDate) {
      whereCondition.createdAt.gte = new Date(fromDate);
    }

    if (toDate) {
      whereCondition.createdAt.lte = new Date(toDate);
    }
  }


  // console.dir(whereCondition, { depth: null });

  const orders = await prisma.order.findMany({
    where: whereCondition,
    orderBy: {
      createdAt: sortByDate === "oldest"
        ? "asc"
        : "desc",
    },
    select: {
      id: true,
      paymentId: true,
      orderNumber: true,
      price: true,
      deliveryFee: true,
      quantity: true,
      currency: true,
      phoneNumber: true,
      zipCode: true,
      city: true,
      country: true,
      state: true,
      region: true,
      deliveryAddress: true,
      createdAt: true,
      orderStatus: true,
      isReviewed: true,
      payment: {
        select: {
          id: true,
          amount: true,
          status: true,
          isPaid: true,
        },
      },
      variant: {
        select: {
          id: true,
          sku: true,
          product: {
            select: { id: true, productName: true, productPhoto: true },
          },
        },
      },
      store: {
        select: {
          seller: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              profileImage: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
          email: true,
          phoneNumber: true,
          deliveryAddress: true,
          city: true,
          state: true,
          zipCode: true,
        },
      },
    },
    skip,
    take: limit,
  });

  const paymentIds = Array.from(
    new Set(orders.map((order) => order.paymentId).filter(Boolean)),
  );

  const siblingOrders = paymentIds.length
    ? await prisma.order.findMany({
      where: {
        paymentId: { in: paymentIds },
        isPaid: true,
      },
      select: {
        id: true,
        paymentId: true,
        price: true,
        quantity: true,
        deliveryFee: true,
      },
    })
    : [];

  const paymentBreakdownMap = new Map<
    string,
    ReturnType<typeof getPaymentBreakdown> & { baseTotal: number }
  >();

  paymentIds.forEach((paymentId) => {
    const paymentOrders = siblingOrders.filter(
      (item) => item.paymentId === paymentId,
    );
    const currentOrder = orders.find((item) => item.paymentId === paymentId);
    const breakdown = getPaymentBreakdown(
      paymentOrders.map((item) => ({
        price: item.price,
        quantity: item.quantity,
        deliveryFee: item.deliveryFee,
      })),
      currentOrder?.payment?.amount,
    );

    paymentBreakdownMap.set(paymentId, {
      ...breakdown,
      baseTotal: roundAmount(breakdown.subtotal + breakdown.deliveryFee),
    });
  });

  const formattedOrders = orders.map((order) => {
    const itemSubtotal = roundAmount(order.price * order.quantity);
    const deliveryFee = roundAmount(order.deliveryFee || 0);
    const shareBase = roundAmount(itemSubtotal + deliveryFee);
    const paymentBreakdown = paymentBreakdownMap.get(order.paymentId);
    const processingFee =
      paymentBreakdown && paymentBreakdown.baseTotal > 0
        ? roundAmount(
          (paymentBreakdown.processingFee * shareBase) /
          paymentBreakdown.baseTotal,
        )
        : 0;

    const deliveryDetails = {
      phoneNumber: order.phoneNumber || order.user?.phoneNumber || null,
      deliveryAddress:
        order.deliveryAddress || order.user?.deliveryAddress || null,
      city: order.city || order.user?.city || null,
      state: order.state || order.user?.state || null,
      region: order.region || null,
      country: order.country || null,
      zipCode: order.zipCode || order.user?.zipCode || null,
    };

    return {
      ...order,
      deliveryDetails: {
        ...deliveryDetails,
        fullDeliveryAddress: buildFullDeliveryAddress(deliveryDetails),
      },
      invoiceSummary: {
        itemSubtotal,
        deliveryFee,
        processingFee,
        totalPayment: roundAmount(shareBase + processingFee),
      },
    };
  });

  const total = await prisma.order.count({ where: whereCondition });
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: formattedOrders,
  };
};

export const StripeServices = {
  createPayment,
  getCustomerSavedCardsFromStripe,
  deleteCardFromCustomer,
  refundPaymentToCustomer,
  handlePaymentSuccess,
  getMyTotalEarnings,
  withdrawRequest,
  getAllWithdrawRequests,
  updateRequestStatus,
  getMyOrders,
  getMyStoreOrders,
  getOrderDetails,
  updateOrderStatus,
};
