import Stripe from "stripe";
import config from "../../../config";
import httpStatus from "http-status";
import { SubscriptionStatus, SubscriptionType } from "@prisma/client";
import { IntervalType } from "@prisma/client";
import { stripe } from "../../../utlits/stripe";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../shared/pagination";

const getEndDate = (interval: IntervalType, intervalCount: number): Date => {
  const now = new Date();
  const endDate = new Date(now);

  switch (interval) {
    case "day":
      endDate.setDate(now.getDate() + intervalCount);
      break;
    case "week":
      endDate.setDate(now.getDate() + intervalCount * 7);
      break;
    case "month":
      endDate.setMonth(now.getMonth() + intervalCount);
      break;
    case "year":
      endDate.setFullYear(now.getFullYear() + intervalCount);
      break;
    default:
      throw new Error("Invalid interval type");
  }

  return endDate;
};

const createSubscriptionIntoDb = async (payload: any) => {
  const isAlreadyExist = await prisma.subscription.findFirst({
    where: {
      type: payload.type,
    },
  });

  if (isAlreadyExist) {
    const res = await updateSubscription(isAlreadyExist.id, payload);
    return res;
  }

  let product: Stripe.Product | null = null;
  let price: any;
  if (payload.title !== SubscriptionType.FREE) {
    product = await stripe.products.create({
      name: payload.title,
      default_price_data: {
        currency: "eur",
        unit_amount: Math.round(parseFloat(payload.price) * 100),
        recurring: {
          interval: payload.interval,
          interval_count: payload.interval_count,
        },
      },
      expand: ["default_price"],
    });
    if (!product) {
      throw new ApiError(httpStatus.BAD_REQUEST, "product not crated");
    }

    price = product.default_price as Stripe.Price;
  }

  const subsription = await prisma.subscription.create({
    data: {
      features: payload.features,
      price: payload.price as number,
      productId: payload.title === SubscriptionType.FREE ? null : product?.id,
      pricingId: payload.title === SubscriptionType.FREE ? null : price.id,
      interval: payload.interval,
      interval_count: payload.interval_count,
      heading: payload.heading || null,
      title: payload.title,
      type: payload.type,
      off: payload.off,
    },
  });
  return subsription;
};

const updateSubscription = async (id: string, payload: any) => {
  const existingSub = await prisma.subscription.findUnique({
    where: { id },
  });

  if (!existingSub) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
  }

  let product = null;
  let price = null;

  if (payload.title !== SubscriptionType.FREE && existingSub.productId) {
    product = await stripe.products.update(existingSub.productId, {
      name: payload.title ?? existingSub.title,
      active: typeof payload.isActive === "boolean" ? payload.isActive : true,
    });
    if (
      payload.price !== undefined ||
      payload.interval !== undefined ||
      payload.interval_count !== undefined
    ) {
      price = await stripe.prices.create({
        product: existingSub.productId,
        unit_amount: Math.round(
          parseFloat(payload.price ?? existingSub.price) * 100,
        ),
        currency: "eur",
        recurring: {
          interval: payload.interval ?? existingSub.interval,
          interval_count: payload.interval_count ?? existingSub.interval_count,
        },
      });
    } else {
      price = { id: existingSub.pricingId } as Stripe.Price;
    }
  }

  const subscription = await prisma.subscription.update({
    where: { id },
    data: {
      title: payload.title ?? existingSub.title,
      type: payload.type ?? existingSub.type,
      price: payload.price ?? existingSub.price,
      interval: payload.interval ?? existingSub.interval,
      interval_count: payload.interval_count ?? existingSub.interval_count,
      features: payload.features ?? existingSub.features,
      off: payload.off ?? existingSub.off,
      heading: payload.heading ?? existingSub.heading,
      isActive:
        typeof payload.isActive === "boolean"
          ? payload.isActive
          : existingSub.isActive,
      pricingId: price?.id ?? existingSub.pricingId,
    },
  });

  return subscription;
};

const getAllSubscriptionPlans = async () => {
  const subscription = await prisma.subscription.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
  return subscription;
};

const purchaseSubscription = async (userId: string, subscriptionId: string) => {
  const subscriptionPlan = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscriptionPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription plan not found");
  }

  if (!subscriptionPlan.pricingId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Paid plan is missing Stripe priceId",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      UserSubscription: {
        include: {
          subscription: true,
        },
      },
    },
  });

  const existingSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId: userId,
      status: "ACTIVE",
    },
    include: {
      subscription: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (existingSubscription) {
    if (existingSubscription.subscription?.type === subscriptionPlan.type) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You are already subscribed to this plan",
      );
    }

    if (
      existingSubscription.subscription?.type === SubscriptionType.SCALERPRO &&
      subscriptionPlan.type === SubscriptionType.STARTERPRO
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You can't downgrade from a scaler plan to a starter plan",
      );
    }

    if (
      existingSubscription.subscription?.type === SubscriptionType.STARTERPRO &&
      subscriptionPlan.type === SubscriptionType.SCALERPRO
    ) {
      if (existingSubscription?.subscriptionPayId) {
        await prisma.userSubscription.update({
          where: { id: existingSubscription.id },
          data: { status: SubscriptionStatus.DEACTIVE },
        });
        try {
          await stripe.subscriptions.update(
            existingSubscription.subscriptionPayId,
            {
              cancel_at_period_end: true,
            },
          );
          console.log(
            `Scheduled cancellation for existing subscription: ${existingSubscription.subscriptionPayId}`,
          );
        } catch (error) {
          console.error("Error cancelling old subscription:", error);
        }
      }
    }
  }

  if (!user.customerId) {
    const customer = await stripe.customers.create({
      email: user.email as string,
      name: user.fullName as string,
      metadata: { userId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { customerId: customer.id },
    });

    user.customerId = customer.id;
  }

  const userSubscription = await prisma.userSubscription.upsert({
    where: {
      userId: userId,
      // userId_subscriptionId: {
      //   userId,
      //   subscriptionId: subscriptionPlan.id,
      // },
    },
    update: {
      subscriptionPayId: subscriptionPlan.pricingId,
      status: "PENDING",
      startDate: new Date(),
      endDate: getEndDate(
        subscriptionPlan.interval,
        subscriptionPlan.interval_count,
      ),
    },
    create: {
      userId,
      subscriptionId: subscriptionPlan.id,
      subscriptionPayId: subscriptionPlan.pricingId,
      status: "PENDING",
      startDate: new Date(),
      endDate: getEndDate(
        subscriptionPlan.interval,
        subscriptionPlan.interval_count,
      ),
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: user.customerId,
    line_items: [
      {
        price: subscriptionPlan.pricingId,
        quantity: 1,
      },
    ],
    success_url: `https://www.sellapy.com/dashboard/success`,
    cancel_url: `https://www.sellapy.com/dashboard/cancel`,
    subscription_data: {
      metadata: {
        subscriptionId: subscriptionPlan.id,
        userId,
        userSubscriptionId: userSubscription.id,
      },
    },
    metadata: {
      subscriptionId: subscriptionPlan.id,
      userId,
      userSubscriptionId: userSubscription.id,
    },
  });

  return { checkoutUrl: session.url };
};

const updateCustomerSubscription = async (payload: any) => {
  const currentSub = await prisma.userSubscription.findFirst({
    where: { subscriptionPayId: payload.id },
  });
  if (!currentSub) return;

  const newPriceId = payload.items.data[0].price.id;

  if (currentSub.priceId !== newPriceId) {
    await prisma.userSubscription.update({
      where: { id: currentSub.id },
      data: {
        priceId: newPriceId,
        subscriptionId: payload.metadata.subscriptionId,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }
};

const handleSubscriptionCreated = async (payload: any) => {
  await prisma.userSubscription.upsert({
    where: { userId: payload.metadata.userId as string },
    update: {
      status: SubscriptionStatus.ACTIVE,
      priceId: payload.items.data[0].price.id,
    },
    create: {
      userId: payload.metadata.userId,
      subscriptionId: payload.metadata.subscriptionId,
      subscriptionPayId: payload.id,
      priceId: payload.items.data[0].price.id,
      status: SubscriptionStatus.ACTIVE,
    },
  });
};

const handleSubscriptionSucceed = async (payload: any) => {
  const subscriptions = await prisma.subscription.findMany({
    where: { id: payload.subscription_details.metadata.subscriptionId },
  });
  const result = await prisma.userSubscription.update({
    where: { userId: payload.subscription_details.metadata.userId },
    data: {
      status: SubscriptionStatus.ACTIVE,
      priceId: payload.lines.data[0].price.id,
      startDate: new Date(),
      endDate: getEndDate(
        subscriptions[0].interval,
        subscriptions[0].interval_count,
      ),
    },
  });
};

const failedCustomerSubscription = async (payload: any) => {
  await prisma.userSubscription.update({
    where: { userId: payload.subscription_details.metadata.userId },
    data: { status: SubscriptionStatus.FAILED },
  });
};

const failedCustomerIntentSubscription = async (payload: any) => {
  await prisma.userSubscription.update({
    where: { userId: payload.metadata.userId },
    data: { status: SubscriptionStatus.DEACTIVE },
  });
};

const cancelSubscription = async (subscriptionId: any, userId: string) => {
  const userSubscription = await prisma.userSubscription.findUnique({
    where: {
      userId_subscriptionId: {
        userId,
        subscriptionId,
      },
    },
  });

  if (!userSubscription || !userSubscription.subscriptionPayId) {
    throw new Error("User subscription not found");
  }

  const stripeCancel = await stripe.subscriptions.update(
    userSubscription?.subscriptionPayId,
    {
      cancel_at_period_end: true,
    },
  );

  await prisma.userSubscription.update({
    where: { id: userSubscription.id },
    data: {
      status: "DEACTIVE",
    },
  });

  return stripeCancel;
};

const handleSubscriptionCancel = async (payload: any) => {
  try {
    const stripeSubId = payload.id;

    const userSub = await prisma.userSubscription.findFirst({
      where: { subscriptionPayId: stripeSubId },
    });

    if (!userSub) {
      console.warn("Subscription not found in DB:", stripeSubId);
      return;
    }

    await prisma.userSubscription.update({
      where: { id: userSub.id },
      data: { status: SubscriptionStatus.DEACTIVE },
    });

    if (userSub.userId) {
      await prisma.user.update({
        where: { id: userSub.userId },
        data: { isSubscription: false },
      });
    }

    console.log(`Subscription ${stripeSubId} cancelled successfully`);
  } catch (err) {
    console.error("Error handling subscription cancellation:", err);
    throw err;
  }
};

const getAllSubscription = async (
  options: IPaginationOptions & { filter?: string },
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const subscriptions = await prisma.userSubscription.findMany({
    include: {
      subscription: {
        select: { price: true },
      },
    },
  });

  const totalRevenue = subscriptions
    .filter((sub) => sub.status === "ACTIVE")
    .reduce((sum, sub) => sum + (sub.subscription?.price || 0), 0);

  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === "ACTIVE",
  ).length;

  const failedPayments = subscriptions.filter(
    (sub) => sub.status === "FAILED",
  ).length;

  const today = new Date();
  const expiringSoon = subscriptions.filter((sub) => {
    if (!sub.endDate) return false;
    const endDate = new Date(sub.endDate);
    const diffInDays = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffInDays <= 7 && diffInDays >= 0;
  }).length;

  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const lastMonthSubs = await prisma.userSubscription.findMany({
    where: {
      createdAt: {
        gte: lastMonthStart,
        lte: lastMonthEnd,
      },
    },
    include: { subscription: true },
  });

  const lastMonthRevenue = lastMonthSubs
    .filter((sub) => sub.status === "ACTIVE")
    .reduce((sum, sub) => sum + (sub.subscription?.price || 0), 0);

  const revenueChange =
    lastMonthRevenue > 0
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  const filter = {};
  if (options.filter) {
    Object.assign(filter, { status: options.filter });
  }

  const result = await prisma.userSubscription.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip,
    where: filter,
    select: {
      id: true,
      status: true,
      createdAt: true,
      startDate: true,
      endDate: true,
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
          email: true,
          role: true,
        },
      },
      subscription: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      },
    },
  });

  const total = await prisma.userSubscription.count();

  return {
    analytics: {
      totalRevenue: `$${totalRevenue.toLocaleString()}`,
      activeSubscriptions,
      failedPayments,
      expiringSoon,
      revenueChange: `${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}% vs last month`,
    },
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getMySubscription = async (userId: string) => {
  const result = await prisma.userSubscription.findFirst({
    where: {
      userId: userId,
      status: "ACTIVE",
    },
    include: {
      subscription: true,
    },
  });

  return result || null;
};

export const subscriptionService = {
  createSubscriptionIntoDb,
  getAllSubscriptionPlans,
  purchaseSubscription,
  handleSubscriptionCreated,
  updateCustomerSubscription,
  handleSubscriptionSucceed,
  failedCustomerSubscription,
  cancelSubscription,
  handleSubscriptionCancel,
  updateSubscription,
  failedCustomerIntentSubscription,
  getAllSubscription,
  getMySubscription,
};
