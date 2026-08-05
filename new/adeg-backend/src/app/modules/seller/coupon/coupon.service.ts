import { DiscountType } from "@prisma/client";
import prisma from "../../../../shared/prisma";
import ApiError from "../../../../errors/ApiErrors";
import httpStatus from "http-status";
import { IPaginationOptions } from "../../../../interfaces/paginations";
import { paginationHelper } from "../../../../shared/pagination";


const createCoupon = async (payload: {
  code: string;
  discountType: DiscountType;
  storeId: string;
  discountValue: number;
  validFrom: Date;
  validTill: Date;
}) => {
  const existingCode = await prisma.coupon.findUnique({
    where: {
      code: payload.code,
    },
  });

  if (existingCode) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Coupon code already exists");
  };

  const result = await prisma.coupon.create({
    data: {
      ...payload
    },
  });
  return result;
};

const getAllCoupon = async (storeId: string, options: IPaginationOptions) => {
  const { limit, skip, page } = paginationHelper.calculatePagination(options);

  const result = await prisma.coupon.findMany({
    where: {
      storeId: storeId,
    },
    skip,      
    take: limit, 
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.coupon.count({
    where: {
      storeId: storeId,
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

const getAllCouponAsAdmin = async ( options: IPaginationOptions) => {
  const { limit, skip, page } = paginationHelper.calculatePagination(options);

  const result = await prisma.coupon.findMany({
    skip,      
    take: limit, 
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.coupon.count({
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

const updateCoupon = async (userId: string, id: string, payload: {
  code: string;
  discountType: DiscountType;
  storeId: string;
  discountValue: number;
  validFrom: Date;
  validTill: Date;
}) => {
  const validUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },select:{
      id: true,
      store: {
        select: {
          id: true,
        }
      }
    }
  });

  const existingCoupon = await prisma.coupon.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingCoupon) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Coupon not found");
  }

  if (validUser?.store[0].id !== existingCoupon.storeId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Coupon not found");
  }
  
  const result = await prisma.coupon.update({
    where: {
      id: id,
    },
    data: {
      ...payload,
    },
  });
  return result;
};

const deleteCoupon = async (userId: string, id: string) => {
   const existingCoupon = await prisma.coupon.findUnique({
    where: {
      id: id,
    },
  });
    if (!existingCoupon) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Coupon not found");
  }
  const validUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },select:{
      id: true,
      store: {
        select: {
          id: true,
        }
      }
    }
  });

  if (validUser?.store[0].id !== existingCoupon.storeId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Coupon not found");
  }
 


  const result = await prisma.coupon.delete({
    where: {
      id: id,
    },
  });
  return result;
};



interface VariantInput {
  variantId: string;
  quantity: number;
}

const applyCoupon = async (code: string, variants: VariantInput[]) => {
  // 1. Check if coupon exists
  const coupon = await prisma.coupon.findUnique({
    where: { code },
    include: { varientCoupons: true }, // include relations
  });

  if (!coupon) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Coupon not found");
  }

  // 2. Check if coupon expired
  if (coupon.validTill < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Coupon is expired");
  }

  // 3. Collect all variantIds from user input
  const variantIds = variants.map(v => v.variantId);

  // 4. Fetch variants with coupon relation
  const validVariants = await prisma.varient.findMany({
    where: { 
      id: { in: variantIds },
      varientCoupons: { some: { couponId: coupon.id } } // must be linked to coupon
    },
    select: {
      id: true,
      price: true,
    },
  });

  // 5. Map user input with DB results
  const result = variants.map(v => {
    const match = validVariants.find(va => va.id === v.variantId);
    if (!match) {
      return {
        variantId: v.variantId,
        quantity: v.quantity,
        eligible: false,
        discountAmount: 0,
        total: 0,
      };
    }

    const total = match.price * v.quantity;

    // here you can apply discount logic (percentage or fixed from coupon)
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (total * coupon.discountValue) / 100;
    } else if (coupon.discountType === "FIXED") {
      discountAmount = coupon.discountValue;
    }

    return {
      variantId: v.variantId,
      quantity: v.quantity,
      eligible: true,
      discountAmount,
      total: total - discountAmount,
    };
  });

  return {
    coupon: {
      id: coupon.id,
      code: coupon.code,
    },
    items: result,
  };
};



export const couponService = {
  createCoupon,
  getAllCoupon,
  getAllCouponAsAdmin,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
};
