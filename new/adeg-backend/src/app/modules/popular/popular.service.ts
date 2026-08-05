import { ObjectId } from "bson";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../shared/pagination";
import prisma from "../../../shared/prisma";

const getMostPopularProducts = async (
  options: IPaginationOptions & {
    categoryId?: string;
  },
) => {
  const { limit, skip, page } = paginationHelper.calculatePagination(options);
  const { categoryId } = options;
  const whereCondition: any = {
    isDeleted: false,
    isPublished: true,
    shop: {
      status: "Approved",
    },
  };

  if (categoryId && ObjectId.isValid(categoryId)) {
    whereCondition.categoryId = categoryId;
  }

  const result = await prisma.product.findMany({
    where: whereCondition,
    orderBy: {
      totalSale: "desc",
    },
    skip,
    take: limit,
    select: {
      id: true,
      productName: true,
      basePrice: true,
      avgRating: true,
      totalSale: true,
      productStatus: true,
      discountPrice: true,
      productPhoto: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const total = await prisma.product.count({ where: whereCondition });

  return {
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getMostPopularStore = async (
  options: IPaginationOptions & { search?: string },
) => {
  const {
    limit = 10,
    skip,
    page,
  } = paginationHelper.calculatePagination(options);
  const whereCondition: any = {
    status: "Approved",
  };

  if (options.search) {
    whereCondition.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { shopName: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const result = await prisma.store.findMany({
    where: whereCondition,
    orderBy: {
      Order: {
        _count: "desc",
      },
    },
    skip,
    take: limit,
    select: {
      id: true,
      shopName: true,
      shopLogo: true,
      name: true,
      bannerImage: true,
      Product: {
        orderBy: {
          totalSale: "desc",
        },
        take: 2,
        select: {
          id: true,
          productName: true,
          productPhoto: true,
        },
      },
    },
  });

  const total = await prisma.store.count({
    where: whereCondition,
  });

  return {
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

export const popularService = {
  getMostPopularProducts,
  getMostPopularStore,
};
