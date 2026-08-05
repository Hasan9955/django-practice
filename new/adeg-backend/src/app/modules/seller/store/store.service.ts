import { storeStatus } from "@prisma/client";
import { IPaginationOptions } from "../../../../interfaces/paginations";
import { paginationHelper } from "../../../../shared/pagination";
import prisma from "../../../../shared/prisma";
import { getPlatformLogo } from "../../../../helpers/sendMailOfOrderConfirmation";
import sendEmail from "../../../../helpers/sendMailBrevo";
import { notificationServices } from "../../notifications/notification.service";
import { sendAdminStoreApprovalEmail } from "../../../../utlits/storeApprovalEmail";

const createBaseSlug = (value: string) => {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "store";
};

const generateUniqueStoreSlug = async (
  source: string,
  excludeStoreId?: string,
) => {
  const baseSlug = createBaseSlug(source);
  let slugCandidate = baseSlug;
  let counter = 1;

  while (true) {
    const existingStore = await prisma.store.findFirst({
      where: {
        slug: slugCandidate,
        ...(excludeStoreId ? { NOT: { id: excludeStoreId } } : {}),
      },
      select: { id: true },
    });

    if (!existingStore) {
      return slugCandidate;
    }

    slugCandidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

const updateStore = async (payload: any) => {
  const existingStore = payload.storeId
    ? await prisma.store.findUnique({
      where: { id: payload.storeId },
      select: {
        id: true,
        name: true,
        shopName: true,
      },
    })
    : null;

  const slugSource =
    payload.slug ||
    payload.shopName ||
    payload.name ||
    existingStore?.shopName ||
    existingStore?.name;

  if (!slugSource) {
    throw new Error("Store name is required to generate slug.");
  }

  const slug = await generateUniqueStoreSlug(slugSource, payload.storeId);

  if (payload.storeId) {
    return await prisma.store.update({
      where: { id: payload.storeId },
      data: {
        bannerImage: payload.bannerImage,
        desc: payload.desc,
        email: payload.email,
        name: payload.name,
        slug,
        country: payload.country,
        city: payload.city,
        address: payload.address,
        zipcode: payload.zipcode,
        shopName: payload.shopName,
        phoneNumber: payload.phoneNumber,
        shopLogo: payload.shopLogo,
      },
    });
  } else {
    // Create Store
    const store = await prisma.store.create({
      data: {
        bannerImage: payload.bannerImage,
        desc: payload.desc,
        email: payload.email,
        name: payload.name,
        slug,
        country: payload.country,
        city: payload.city,
        address: payload.address,
        zipcode: payload.zipcode,
        shopName: payload.shopName,
        phoneNumber: payload.phoneNumber,
        shopLogo: payload.shopLogo,
        seller: {
          connect: {
            id: payload.sellerId,
          },
        },
      },
      include: {
        seller: true,
      },
    });


    sendAdminStoreApprovalEmail(
      store,
      store.seller
    ).catch((err) => {
      console.error("Failed to send admin store approval email:", err);
    });

    return store;

  }
};

const getMystore = async (sellerId: string) => {
  const store = await prisma.store.findFirst({
    where: { sellerId },
    select: {
      id: true,
      bannerImage: true,
      name: true,
      shopName: true,
      shopLogo: true,
      slug: true,
      desc: true,
      email: true,
      country: true,
      city: true,
      address: true,
      zipcode: true,
      phoneNumber: true,
      followers: true,
      createdAt: true,
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });

  if (!store) {
    throw new Error("Store not found for this seller.");
  }

  const stats = await prisma.order.aggregate({
    // _sum: {
    //   quantity: true,
    //   price: true,
    // },
    _count: {
      id: true,
    },
    where: {
      orderStatus: { in: ["Accepted", "Delivered", "Pending", "Rejected", "Shipped", "Refunded"] },
      storeId: store.id,
    },
  });

  const revenue = await prisma.order.aggregate({
    _sum: {
      quantity: true,
      price: true,
    },
    where: {
      orderStatus: { in: ["Accepted", "Delivered", "Pending", "Shipped"] },
      storeId: store.id,
    },
  });

  const totalItemSold = revenue._sum.quantity || 0;
  const totalRevenue = revenue._sum.price || 0;
  const totalOrders = stats._count.id || 0;
  // const totalItemSold = stats._sum.quantity || 0;
  // const totalRevenue = stats._sum.price || 0;

  return {
    ...store,
    totalItemSold,
    totalRevenue,
    totalOrders,
  };
};

const getUserStore = async (storeId: string, userId?: string) => {
  const sellerId = await prisma.store.findUnique({
    where: { id: storeId },
    select: { sellerId: true },
  });

  const store = await prisma.store.findFirst({
    where: { sellerId: sellerId?.sellerId },
    select: {
      id: true,
      bannerImage: true,
      name: true,
      desc: true,
      shopName: true,
      shopLogo: true,
      slug: true,
      country: true,
      city: true,
      address: true,
      zipcode: true,
      createdAt: true,
      followers: true,
      followings: true,
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });

  let isFollowedByMe = null;
  if (userId) {
    isFollowedByMe = await prisma.follow.findFirst({
      where: { followerId: userId, storeId: storeId },
    });
  }

  if (!store) {
    throw new Error("Store not found for this seller.");
  }

  const stats = await prisma.order.aggregate({
    _sum: {
      quantity: true,
      price: true,
    },
    _count: {
      id: true,
    },
    where: {
      orderStatus: "Shipped",
      storeId: store.id,
    },
  });

  const totalItemSold = stats._sum.quantity || 0;
  const totalRevenue = stats._sum.price || 0;
  const totalOrders = stats._count.id || 0;

  return {
    ...store,
    isFollowedByMe: isFollowedByMe ? true : false,
    totalItemSold,
    totalRevenue,
    totalOrders,
  };
};

const getSingleStore = async (slug: string, userId?: string) => {
  const sellerId = await prisma.store.findUnique({
    where: { slug },
    select: { sellerId: true },
  });

  const store = await prisma.store.findFirst({
    where: { sellerId: sellerId?.sellerId },
    select: {
      id: true,
      bannerImage: true,
      name: true,
      desc: true,
      shopName: true,
      shopLogo: true,
      slug: true,
      country: true,
      city: true,
      address: true,
      zipcode: true,
      createdAt: true,
      followers: true,
      followings: true,
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });

  let isFollowedByMe = null;
  if (userId) {
    isFollowedByMe = await prisma.follow.findFirst({
      where: { followerId: userId, storeId: store?.id },
    });
  }

  if (!store) {
    throw new Error("Store not found for this seller.");
  }

  const stats = await prisma.order.aggregate({
    _sum: {
      quantity: true,
      price: true,
    },
    _count: {
      id: true,
    },
    where: {
      orderStatus: "Shipped",
      storeId: store.id,
    },
  });

  const totalItemSold = stats._sum.quantity || 0;
  const totalRevenue = stats._sum.price || 0;
  const totalOrders = stats._count.id || 0;

  return {
    ...store,
    isFollowedByMe: isFollowedByMe ? true : false,
    totalItemSold,
    totalRevenue,
    totalOrders,
  };
};

const getAllStoreForUser = async (
  options: IPaginationOptions & { status?: string; search?: string },
) => {
  const { limit, skip, page } = paginationHelper.calculatePagination(options);
  const { search, status } = options;
  const whereCondition: any = {
    status: "Approved",
  };

  if (search) {
    whereCondition.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { shopName: { contains: search, mode: "insensitive" } },
    ];
  }


  const result = await prisma.store.findMany({
    where: whereCondition,
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: {
      followers: "desc",
    },
  });

  const total = await prisma.store.count({
    where: whereCondition,
  });

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
const getAllStore = async (
  options: IPaginationOptions & { search?: string; status?: string },
) => {
  const { limit, skip, page } = paginationHelper.calculatePagination(options);
  const { search, status } = options;

  const where: any = {};
  if (status && status !== "All") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { shopName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },

    ];
  }

  const result = await prisma.store.findMany({
    where,
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          location: true,
          state: true,
          city: true,
          companyName: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.store.count({ where });

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

const subscribeStore = async (userId: string, payload: any) => {
  const isAlreadySubscribed = await prisma.storeSubscriber.findFirst({
    where: {
      userEmail: payload.userEmail,
      storeId: payload.storeId,
    },
  });

  if (isAlreadySubscribed) {
    throw new Error("You are already subscribed to this store.");
  }

  const result = await prisma.storeSubscriber.create({
    data: {
      storeId: payload.storeId,
      userId,
      userEmail: payload.userEmail,
    },
  });

  return result;
};

const updateStoreStatus = async (storeId: string, status: string) => {

  const res = await prisma.store.update({
    where: { id: storeId },
    data: { status: status as storeStatus },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  if (status === "Approved") {

    if (res.seller.email) {

      const platformLogo = await getPlatformLogo();

      const subject = "Your Store Has Been Approved!";

      const html = `
  <body style="font-family: sans-serif; background-color: #f6f9fc; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      
      <!-- Logo Header -->
      <div style="background: #ffffff; padding: 20px; text-align: center; border-bottom: 1px solid #eee;">
        <img 
          src="${platformLogo}" 
          alt="Platform Logo" 
          style="max-height: 60px; max-width: 200px; object-fit: contain;" 
        />
      </div>

      <!-- Main Header -->
      <div style="background: #007BFF; padding: 30px; text-align: center; color: white;">
        <h2 style="margin: 0 0 8px;">Your Store Has Been Approved!</h2>
        <p style="margin: 0;">You can now start selling on our platform.</p>
      </div>

      <!-- Email Content -->
      <div style="padding: 20px;">
        <p>Hi ${res.seller.fullName || "There"},</p>

        <p>
          Great news! Your store application has been reviewed and approved by our admin team.
        Your store is now active and ready to receive orders.
        </p>

        <div style="background: #f6f9fc; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 10px;">
            <strong>Store Name:</strong> ${res.shopName}
          </p>

          <p style="margin: 0;">
            <strong>Store Status:</strong>
            <span style="color: #28a745; font-weight: bold;">Approved</span>
          </p>
        </div>

        <p>
          You can now add products, manage inventory, and start receiving orders from customers.
        </p>

        <div style="text-align: center; margin-top: 25px;">
          <a 
            href="https://sellapy.com/dashboard" 
            style="background: #007BFF; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 8px; display: inline-block;"
          >
            Go to Seller Dashboard
          </a>
        </div>
      </div>

      <!-- Logo Footer -->
      <div style="background: #f6f9fc; padding: 16px; text-align: center; border-top: 1px solid #eee;">
        <img 
          src="${platformLogo}" 
          alt="Platform Logo" 
          style="max-height: 40px; max-width: 140px; object-fit: contain; opacity: 0.7;" 
        />

        <p style="margin: 10px 0 0; font-size: 12px; color: #777;">
          Thank you for being a seller on our platform.
        </p>
      </div>

    </div>
  </body>
`;

      sendEmail(res.seller.email, subject, html);

    }


    let sellerId = res.seller.id as string;


    try {
      await notificationServices.sendSingleNotification({
        id: sellerId,
        body: `Your store has been approved. You can now start selling on our platform.`,
        title: "Store Approved",
      })
    } catch (error) {
      console.log("Failed to send notification:", error);
    }
  }


  return res;
};

export const storeService = {
  updateStore,
  getMystore,
  getUserStore,
  getAllStore,
  getAllStoreForUser,
  updateStoreStatus,
  getSingleStore,
  subscribeStore,
};
