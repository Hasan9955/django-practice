import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { fileUploader } from "../../middlewares/fileUploder";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../shared/pagination";

const addProductReview = async (
  orderId: string,
  reviewData: any,
  files: any,
  userId: string,
) => {
  const orderInfo = await prisma.order.findUnique({
    where: { id: orderId },
    include: { variant: true },
  });

  if (!orderInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  if (orderInfo.isReviewed) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order already reviewed");
  }

  if (!orderInfo.variant) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order variant not found");
  }

  const productId = orderInfo.variant.productId;

  let image: string[] = [];
  let video = "";

  if (files?.reviewImage?.length > 0) {
    image = await Promise.all(
      files.reviewImage.map(async (file: any) => {
        const res = await fileUploader.uploadToDigitalOcean(file);
        return res.Location;
      }),
    );
  }

  if (files?.reviewVideo?.length > 0) {
    const res = await fileUploader.uploadToDigitalOcean(files.reviewVideo[0]);
    video = res.Location;
  }

  const rating = Number(reviewData.rating);

  if (isNaN(rating) || rating < 0 || rating > 5) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Rating must be between 0 and 5",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        productId,
        userId,
        comment: reviewData.comment,
        rating: Number(rating.toFixed(2)),
        image,
        video,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { isReviewed: true },
    });

    const avgResult = await tx.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    const avgRating = parseFloat((avgResult._avg.rating ?? 0).toFixed(2));

    await tx.product.update({
      where: { id: productId },
      data: { avgRating },
    });

    return review;
  });

  return result;
};

const getProductReviews = async (
  productId: string,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.review.findMany({
    where: {
      productId: productId,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.review.count({
    where: {
      productId: productId,
    },
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

const getSellerReviews = async (
  sellerId: string,
  options: IPaginationOptions & {
    productId?: string;
    date?: string;
  },
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const { productId, date } = options;

  const whereCondition: any = {
    product: {
      shop: {
        sellerId,
      },
    },
  };

  if (productId) {
    whereCondition.productId = productId;
  }

  if (date) {
    // Convert to start and end of day range for accuracy
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    whereCondition.createdAt = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  const sellerInfo = await prisma.user.findUnique({
    where: {
      id: sellerId,
      role: { in: ["SELLER", "ALL"] },
    },
  });

  if (!sellerInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, "Seller not found");
  }

  const result = await prisma.review.findMany({
    where: whereCondition,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const getAllReview = await prisma.review.findMany({
    where: {
      product: {
        shop: {
          sellerId,
        },
      },
    },
  });

  const total = getAllReview.length;
  const averageRating = parseFloat(
    (getAllReview.reduce((acc, cur) => acc + cur.rating, 0) / total).toFixed(2),
  );

  return {
    meta: {
      page,
      limit,
      total,
      averageRating,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getUserReviews = async (userId: string, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.review.findMany({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
      product: {
        select: {
          id: true,
          productName: true,
          productPhoto: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.review.count({
    where: {
      userId,
    },
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

const updateReview = async (reviewId: string, updatedData: any) => {};

const deleteReview = async (reviewId: string, userId: string) => {
  const reviewInfo = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!reviewInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  }

  if (!reviewInfo.productId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Product ID not found for this review",
    );
  }

  // If need this validation in future
  // if (reviewInfo.userId !== userId) {
  //     throw new ApiError(httpStatus.FORBIDDEN, "You don't have permission to delete this review")
  // }

  const deleteReview = await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  //update average rating in product model
  const getAllReview = await prisma.review.findMany({
    where: {
      productId: reviewInfo.productId,
    },
  });

  const totalRating = getAllReview.reduce((acc, cur) => acc + cur.rating, 0);
  const avgRating = parseFloat((totalRating / getAllReview.length).toFixed(2));

  await prisma.product.update({
    where: {
      id: reviewInfo.productId,
    },
    data: {
      avgRating,
    },
  });

  return {
    message: "Review deleted successfully",
  };
};

export const ReviewService = {
  addProductReview,
  getProductReviews,
  getSellerReviews,
  getUserReviews,
  updateReview,
  deleteReview,
};
