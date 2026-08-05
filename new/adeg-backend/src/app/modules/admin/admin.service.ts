import prisma from "../../../shared/prisma";
import bcrypt from "bcryptjs";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import { searchAndPaginate } from "../../../helpers/searchAndPaginate";
import { Prisma, User, UserRole } from "@prisma/client";
import httpStatus from "http-status";
import { accountCreationEmail } from "../../lib/registerTemplete";
import sendEmail from "../../../helpers/sendMailBrevo";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../shared/pagination";
import { AwsContextImpl } from "twilio/lib/rest/accounts/v1/credential/aws";
import { constructFromSymbol } from "date-fns/constants";

const loginAdmin = async (payload: any) => {
  const user = await prisma.admin.findUnique({
    where: {
      email: payload.email.toLowerCase(),
    },
    include: {
      user: true,
    }, 
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(
    payload.password.trim() as string,
    user?.password?.trim() as string,
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }
  const accessToken = jwtHelpers.generateToken(
    user,
    config.jwt.jwt_secret as string,
    config.jwt.expires_in,
  );
  const { password, createdAt, updatedAt, ...userInfo } = user;

  return {
    accessToken,
    user,
  };
};

const getAllUser = async (
  page: number = 1,
  limit: number = 10,
  searchQuery: string = "",
) => {
  const additionalFilter: Prisma.UserWhereInput = {
    NOT: {
      role: "ADMIN",
    },
  };
  const user = await searchAndPaginate<
    typeof prisma.user,
    Prisma.UserWhereInput,
    Prisma.UserSelect
  >(
    prisma.user,
    ["fullName", "email"],
    page,
    limit,
    searchQuery,
    additionalFilter,
    {
      select: {
        fullName: true,
        id: true,
        email: true,
        status: true,
        Profile: true,
      },
    },
  );

  return user;
};

const platformUpdate = async (payload: any) => {
  

  const platform = await prisma.platformMangement.findUnique({
    where: { 
      id: payload.platformId || "67de4b5db3d0bda15b780ca3",
    },
  });
  if (!platform) {
    throw new ApiError(httpStatus.NOT_FOUND, "platform not found");
  }

  const updateData: any = {
    shippingPolicy: payload.shippingPolicy || platform.shippingPolicy,
    logo: payload.logo || platform.logo,
    commisionRate: payload.commisionRate,
    currency: payload.currency || platform.currency,
  };

  
  if (payload.cmsSettingTitle || payload.aboutUs || payload.bannerImage || payload.redirectUrl) {
    updateData.CmsSetting = {
      upsert: {
        where: { platformId: payload.platformId || "67de4b5db3d0bda15b780ca3" },
        update: {
          title: payload.cmsSettingTitle,
          aboutUs: payload.aboutUs,
          bannerImage: payload.bannerImage,
          redirectUrl: payload.redirectUrl,
        },
        create: {
          platformId: payload.platformId!,
          title: payload.cmsSettingTitle,
          aboutUs: payload.aboutUs,
          bannerImage: payload.bannerImage,
          redirectUrl: payload.redirectUrl,
        },
      }, 
    };
  }

  if (payload.banners?.length) {
    updateData.banner = {
      createMany: {
        data: payload.banners.map((b: any) => ({
          bannerUrl: b.bannerUrl,
          redirectUrl: b.redirectUrl,
          title: b.title,
          description: b.description,
        })),
      },
    };
  }

  
  if (payload.categories?.length) {
    const formattedNames = payload.categories.map((c: any) =>
      c.name.toLowerCase().trim().replace(/\s+/g, "_"),
    );

    const existingCategories = await prisma.category.findMany({
      where: { name: { in: formattedNames } },
    });

    if (existingCategories.length) {
      const existingNames = existingCategories.map((c) => c.displayName);
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Categories already exist: ${existingNames.join(", ")}`,
      );
    }

    const categoriesToCreate = await Promise.all(
      payload.categories.map(async (c: any) => {
        const formattedName = c.name.toLowerCase().trim().replace(/\s+/g, "_");

        let ancestors: string[] = [];
        if (c.parentId) {
          const parentCategory = await prisma.category.findUnique({
            where: { id: c.parentId },
          });
          if (!parentCategory) throw new Error("Parent category not found");
          ancestors = [...parentCategory.ancestors, parentCategory.id];
        }

        return {
          name: formattedName,
          displayName: c.name,
          categoryPhoto: c.categoryPhoto,
          parentId: c.parentId ?? null,
          ancestors,
          Attribute: {
            create: (c.attributes || []).map((attr: any) => ({
              name: attr.name,
              type: attr.type.toUpperCase(),
              isRequired: attr.isRequired ?? false,
              values: {
                create: (attr.values || []).map((val: any) => ({
                  value: typeof val === "string" ? val : val.value,
                  isApproved: true,
                })),
              },
            })),
          },
        };
      }),
    );

    updateData.category = { create: categoriesToCreate };
  }

  return await prisma.platformMangement.update({
    where: { id: payload.platformId || "67de4b5db3d0bda15b780ca3" },
    data: updateData,
  });
};

const getAllPlatformData = async (platformId: string) => {
  const result = await prisma.platformMangement.findUnique({
    where: {
      id: platformId || "67de4b5db3d0bda15b780ca3",
    },
    include: {
      banner: true,
      category: {
        where: { isDeleted: false },
      },
      CmsSetting: {
        select: {
          id: true,
          title: true,
          aboutUs: true,
          bannerImage: true,
          redirectUrl: true,
          createdAt: true,
          updatedAt: true,
          faq: true,
          privacyPolicy: true,
          footer: true,
        },
      },
    },
  });
  return result;
};

const getPlatformDataForUser = async (platformId: string) => {
  const result = await prisma.platformMangement.findUnique({
    where: {
      id: platformId || "67de4b5db3d0bda15b780ca3",
    },
    select: {
      commisionRate: true,
      currency: true,
      shippingPolicy: true,
      CmsSetting: {
        select: {
          title: true,
          aboutUs: true,
          bannerImage: true,
          redirectUrl: true,

          faq: {
            select: {
              id: true,
              question: true,
              answer: true,
            },
          },
          privacyPolicy: true,
          footer: true,
          platform: {
            select: {
              logo: true,
              banner: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  bannerUrl: true,
                  redirectUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return result;
};

const createUser = async (payload: User) => {
  const hashPassword = await bcrypt.hash(payload?.password as string, 10);
  try {
    const isExist = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (isExist) {
      throw new ApiError(httpStatus.CONFLICT, "Email  already exists");
    }
    const result = await prisma.user.create({
      data: {
        fullName: payload.fullName,
        email: payload.email.toLowerCase(),
        password: hashPassword,
        role: payload.role,
        isOtpVerify: true,
      },
    });

    const emailSubject = "Welcome to Our Service!";
    const emailText = `Hello ${payload.fullName},\n\nWelcome to our service! Your account has been successfully created.\n\nBest regards,\nThe Team`;

    const emailHTML = accountCreationEmail(payload.email, payload.fullName);

    await sendEmail(payload.email, emailSubject, emailHTML, emailText);
    return;
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new ApiError(httpStatus.CONFLICT, "Email  already exists");
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getAllUserAsAdmin = async (options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const additionalFilter: Prisma.UserWhereInput = {
    NOT: {
      role: { in: ["ADMIN", "SELLER", "BUYER", "USER"] },
    },
  };

  const user = await prisma.user.findMany({
    where: additionalFilter,
    skip: skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return user;
};

const updateUserRole = async (userId: string, role: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  const result = await prisma.user.update({
    where: { id: userId },
    data: {
      role: role as UserRole,
    },
  });
  return result;
};

const updateSingleCategory = async (categoryId: string, payload: any) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  const formattedName = payload.name?.toLowerCase().trim().replace(/\s+/g, "_");

  if (formattedName && formattedName !== category.name) {
    const existingName = await prisma.category.findUnique({
      where: { name: formattedName },
    });

    if (existingName) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        "Category name already taken. Please use another one",
      );
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: formattedName || category.name,
      displayName: payload.name || category.displayName,
      categoryPhoto: payload.categoryPhoto || category.categoryPhoto,
    },
  });

  return updatedCategory;
};
const deleteSingleCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId, isDeleted: false },
  });
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: { isDeleted: true },
  });

  return category;
};

export const adminService = {
  loginAdmin,
  getAllUser,
  platformUpdate,
  createUser,
  getAllPlatformData,
  getPlatformDataForUser,
  getAllUserAsAdmin,
  updateUserRole,
  updateSingleCategory,
  deleteSingleCategory,
};
