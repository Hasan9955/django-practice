import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import { sendOtpToGmail } from "../../../helpers/sendOtpToEmail";
import { searchAndPaginate } from "../../../helpers/searchAndPaginate";
import { subscriptionService } from "../subscription/subscription.service";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../shared/pagination";

const createUser = async (payload: User) => {
  const hashPassword = await bcrypt.hash(payload?.password as string, 10);
  try {
    const isExist = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (isExist && isExist.isDeleted) {
      throw new ApiError(
        httpStatus.TEMPORARY_REDIRECT,
        "Using this email you created an account but it has been deleted. Please contact with admin or sign up another email.",
      );
    }

    if (isExist && !isExist.isOtpVerify) {
      sendOtpToGmail(isExist);
      const token = jwtHelpers.generateToken(
        { id: isExist?.id },
        config.otpSecret.signup_otp_secret as Secret,
      );
      return {
        token,
      };
    }

    const result = await prisma.user.create({
      data: {
        fullName: payload.fullName,
        email: payload.email.toLowerCase(),
        password: hashPassword,
        phoneNumber: payload.phoneNumber,
        companyName: payload.companyName || "",
        role: payload.role === "BUYER" ? "USER" : payload.role,
      },
    });

    const token = jwtHelpers.generateToken(
      { id: result.id },
      config.otpSecret.signup_otp_secret as Secret,
    );
    sendOtpToGmail(result);
    return {
      token,
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new ApiError(httpStatus.CONFLICT, "Email  already exists");
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const updateProfile = async (payload: any, userId: string) => {
  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isProfile: true,
      profileImage: payload.profileImage,
      coverPhoto: payload.coverPhoto,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      location: payload.location,
      deliveryAddress: payload.deliveryAddress,
      zipCode: payload.zipCode,
      city: payload.city,
      state: payload.state,
      Profile: {},
    },
    select: {
      id: true,
    },
  });

  return result;
};

const getUserProfile = async (userId: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      Profile: true,
      role: true,
      profileImage: true,
      coverPhoto: true,
      location: true,
      phoneNumber: true,
      deliveryAddress: true,
      zipCode: true,
      city: true,
      state: true,
      rewardPoint: true,
      UserSubscription: {
        where: {
          status: "ACTIVE",
        },
        include: {
          subscription: {
            select: {
              id: true,
              type: true,
              interval: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User profile not found");
  }

  return result;
};

const searchUser = async (
  page: number = 1,
  limit: number = 10,
  searchQuery: string = "",
  filter: { branch?: string; serviceYear?: string } = {},
) => {
  const profileFilter: Prisma.ProfileWhereInput = {};

  const additionalFilter: Prisma.UserWhereInput = {
    NOT: {
      role: "ADMIN",
    },
    Profile: Object.keys(profileFilter).length ? profileFilter : undefined,
  };

  const users = await searchAndPaginate<
    typeof prisma.user,
    Prisma.UserWhereInput,
    Prisma.UserSelect
  >(
    prisma.user,
    ["fullName", "email"],
    page || 1,
    limit || 10,
    searchQuery,
    additionalFilter,
    {
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        user1Convarsion: true,
        user2Convarsion: true,
        Profile: true,
      },
    },
  );

  return { users };
};

const getOtherUserProfile = async (userId: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      fullName: true,
      location: true,
      Profile: {},
      profileImage: true,
      coverPhoto: true,
      rewardPoint: true,
      role: true,
      createdAt: true,
      store: {
        select: {
          id: true,
          shopLogo: true,
          shopName: true,
          bannerImage: true,
        },
      },
      UserSubscription: {
        where: {
          status: "ACTIVE",
        },
        include: {
          subscription: {
            select: {
              id: true,
              type: true,
              interval: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User profile not found");
  }

  const orders = await prisma.order.findMany({
    where: {
      store: {
        sellerId: userId
      },
      isPaid: true
    },
    select: {
      quantity: true
    }
  })

  const totalSales = orders.reduce((sum, o) => sum + o.quantity, 0);

  const totalFollower = await prisma.follow.count({
    where: {
      store: {
        sellerId: userId
      }
    }
  })



  return { ...result, totalSales, totalFollower };
};

const deleteAccount = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
      isDeleted: false,
    },
  });
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found or already deleted",
    );
  }

  if (user.role === UserRole.SELLER || user.role === UserRole.ALL) {
    //cancel subscription if exist
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
    });
    if (activeSubscription) {
      await subscriptionService.cancelSubscription(
        activeSubscription.subscriptionId,
        userId,
      );
    }
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isDeleted: true,
    },
  });
  return;
};

const getAllUsers = async (
  options: IPaginationOptions & { status?: string; search?: string; role?: UserRole },
) => {
  const { limit, skip, page } = paginationHelper.calculatePagination(options);

  const { search } = options;

  const whereCondition: any = {
    role: { notIn: ["ADMIN", "SUB_ADMIN"] },
    isDeleted: false,
  };

  if (search) {
    whereCondition.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (options.role === UserRole.USER) {
    whereCondition.role = options.role;
  }

  if(options.role === UserRole.SELLER) {
    whereCondition.role = { in: [UserRole.SELLER, UserRole.ALL] };
  }

  const result = await prisma.user.findMany({
    where: whereCondition,
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      coverPhoto: true,
      profileImage: true,
      location: true,
      zipCode: true,
      companyName: true,
      status: true,
      role: true,
    },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.user.count({
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

const updateUserStatus = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const res = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: status,
    },
    select: {
      id: true,
      status: true,
    }
  });

  return res;
};

const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
      isDeleted: false,
    },
  });
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found or already deleted",
    );
  }

  if (user.role === UserRole.SELLER || user.role === UserRole.ALL) {
    //cancel subscription if exist
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
    });
    if (activeSubscription) {
      await subscriptionService.cancelSubscription(
        activeSubscription.subscriptionId,
        userId,
      );
    }
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isDeleted: true,
    },
  });

  return;
  
};


export const userService = {
  createUser,
  updateProfile,
  getUserProfile,
  searchUser,
  getOtherUserProfile,
  deleteAccount,
  getAllUsers,
  updateUserStatus,
  deleteUser
};
