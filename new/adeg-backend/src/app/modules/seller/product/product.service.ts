import httpStatus from "http-status";
import ApiError from "../../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../../interfaces/paginations";
import { paginationHelper } from "../../../../shared/pagination";
import prisma from "../../../../shared/prisma";
import { ObjectId } from "bson";
import { getB2BPackagePricing, parseMOQ } from "../../../../helpers/b2bPackage";
import { PackageTag } from "@prisma/client";

const createProduct = async (payload: any) => {
  const storeStatus = await prisma.store.findUnique({
    where: {
      id: payload.storeId,
    },
  });

  if (storeStatus?.status !== "Approved") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Store is not approved");
  };

  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid categoryId");
  }

  const couponIds: string[] = Array.from(
    new Set(
      (Array.isArray(payload.varients) ? payload.varients : [])
        .flatMap((variant: any) => (Array.isArray(variant?.coupons) ? variant.coupons : []))
        .filter(Boolean),
    ),
  );

  if (couponIds.length) {
    const existingCoupons = await prisma.coupon.findMany({
      where: { id: { in: couponIds } },
      select: { id: true },
    });

    const existingCouponIds = new Set(existingCoupons.map((coupon) => coupon.id));
    const invalidCouponIds = couponIds.filter((couponId) => !existingCouponIds.has(couponId));

    if (invalidCouponIds.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Invalid coupon IDs: ${invalidCouponIds.join(", ")}`,
      );
    }
  }

  return await prisma.product.create({
    data: {
      productName: payload.productName,
      basePrice: payload.basePrice ?? 0,
      discountPrice: payload.discountPrice ?? 0,
      discountStartDate: payload.discountStartDate
        ? new Date(payload.discountStartDate)
        : new Date(),
      discountEndTime: payload.discountEndTime
        ? new Date(payload.discountEndTime)
        : new Date(),

      desc: payload.desc,
      productDetails: payload.productDetails,
      categoryId: payload.categoryId,
      productPhoto: payload.productPhoto ?? [],
      searchTag: payload.searchTag ?? [],
      storeId: payload.storeId,
      B2BPackage: payload.b2bPackages?.length
        ? {
          create: payload.b2bPackages.map((pkg: any) => ({
            ...(() => {
              const moq = parseMOQ(pkg.moq ?? pkg.quantity);

              if (!moq) {
                throw new ApiError(httpStatus.BAD_REQUEST, "B2B MOQ must be a positive integer");
              }

              if (
                pkg.b2bPackageTag &&
                !Object.values(PackageTag).includes(pkg.b2bPackageTag as PackageTag)
              ) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Invalid b2bPackageTag");
              }

              return {
                quantity: String(pkg.quantity ?? moq),
                price: Number(pkg.price ?? 0),
                moq,
                maxMOQ: pkg.maxMOQ ?? null,
                pricePerUnit: Number(pkg.pricePerUnit ?? 0),
                b2bPackageTag: (pkg.b2bPackageTag as PackageTag) || PackageTag.SmallSupply,
              };
            })(),
          })),
        }
        : undefined,
      BundleOffer: payload.bundleOffers?.length
        ? {
          create: payload.bundleOffers.map((bundle: any) => ({
            quantity: bundle.quantity,
            discount: bundle.discount,
            bundleTag: bundle.bundleTag,
          })),
        }
        : undefined,


      Varient: payload.varients?.length
        ? {
          create: payload.varients.map((variant: any) => ({
            sku: variant.sku,
            stock: variant.stock,
            price: variant.price,
            attributes: variant.attributes,
            varientCoupons: variant.coupons?.length
              ? {
                create: variant.coupons.map((couponId: string) => ({
                  coupon: {
                    connect: { id: couponId },
                  },
                })),
              }
              : undefined,
          })),
        }
        : undefined,

      productFaq: payload.productFaq?.length
        ? {
          create: payload.productFaq.map((faq: any) => ({
            question: faq.question,
            answer: faq.answer,
          })),
        }
        : undefined,
    },
    include: {
      B2BPackage: true,
      BundleOffer: true,
      Varient: {
        include: {
          varientCoupons: {
            include: { coupon: true },
          },
        },
      },
      productFaq: true
    },
  });
};


const getMyProducts = async (userId: string) => {
  const result = await prisma.store.findMany({
    where: {
      sellerId: userId,
      Product: {
        some: {
          isDeleted: false,
        },
      },
    },
    select: {
      id: true,
      Product: {
        where: {
          isDeleted: false,
        },
        select: {
          id: true,
          productName: true,
          isPublished: true,
          totalSale: true,
          productStatus: true,
          productPhoto: true,
        },
      },
    },
  });

  return result;
};


const publishedProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { isPublished: true },
  });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  const result = await prisma.product.update({
    where: { id },
    data: { isPublished: !product.isPublished },
    select: { isPublished: true },
  });

  return result;
};


const getAllProducts = async (
  options: IPaginationOptions & {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
  }
) => {
  const { limit, skip, page } = paginationHelper.calculatePagination(options);
  const { search, categoryId, minPrice, maxPrice } = options;


  const where: any = {
    isDeleted: false,
    isPublished: true,
    shop: {
      status: "Approved"
    }
  };


  if (search) {
    where.OR = [
      {
        productName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        category: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        shop: {
          shopName: {
            contains: search,
            mode: "insensitive",
          },
        },
      }
    ];
  }


  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.basePrice = {};
    if (minPrice !== undefined) {
      where.basePrice.gte = Number(minPrice);
    }
    if (maxPrice !== undefined) {
      where.basePrice.lte = Number(maxPrice);
    }
  }


  const result = await prisma.product.findMany({
    where,
    orderBy: {
      createdAt: "desc",
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


  const total = await prisma.product.count({ where });


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

const getSingleStoreProducts = async (
  storeId: string,
  options: IPaginationOptions & {
    maxPrice?: string;
    minPrice?: string;
    categoryId?: string;
    topSelling?: boolean;
  }
) => {
  const { limit, skip, page } = paginationHelper.calculatePagination(options);

  const { categoryId, maxPrice, minPrice } = options;

  const whereCondition: any = {
    storeId,
    isDeleted: false,
    isPublished: true,
  };

  let orderBy: any = {};

  if (options.topSelling) {
    orderBy = {
      totalSale: "desc",
    };
  } else {
    orderBy = {
      createdAt: "desc",
    };
  }


  if (categoryId && ObjectId.isValid(categoryId)) {
    whereCondition.categoryId = categoryId;
  }


  if (minPrice || maxPrice) {
    whereCondition.basePrice = {};

    if (minPrice) {
      whereCondition.basePrice.gte = parseFloat(minPrice);
    }

    if (maxPrice) {
      whereCondition.basePrice.lte = parseFloat(maxPrice);
    }
  }

  const result = await prisma.product.findMany({
    where: whereCondition,
    orderBy,
    skip,
    take: limit,
    select: {
      id: true,
      productName: true,
      basePrice: true,
      avgRating: true,
      productStatus: true,
      discountPrice: true,
      productPhoto: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      Varient: {
        select: {
          id: true,
          Order: {
            where: {
              isPaid: true,
            },
            select: {
              quantity: true,
            },
          },
        },
      },
    },
  });

  const products = result.map((product) => {
  const totalSale = product.Varient.reduce((productTotal: number, variant) => {
    const variantTotal = variant.Order.reduce(
      (sum: number, order) => sum + order.quantity,
      0,
    );

    return productTotal + variantTotal;
  }, 0);

  return {
    id: product.id,
    productName: product.productName,
    basePrice: product.basePrice,
    avgRating: product.avgRating,
    productStatus: product.productStatus,
    discountPrice: product.discountPrice,
    productPhoto: product.productPhoto,
    category: product.category,
    totalSale,
  };
});

  const total = await prisma.product.count({ where: whereCondition });


  // Get Seller Details 

  const storeInfo = await prisma.user.findFirst({
    where: {
      store: {
        some: {
          id: storeId
        }
      },
    },
    select: {
      id: true,
      fullName: true,
      location: true,
      createdAt: true,
      store: {
        select: {
          id: true,
          name: true,
          shopName: true,
          shopLogo: true,
          bannerImage: true,
          createdAt: true,
          followers: true,
          desc: true,
        },
      },
      NicheHub: {
        take: 4,
        orderBy: {
          createdAt: "desc"
        }
      },
      _count: {
        select: {
          Order: true
        }
      }
    }
  })
  return {
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
    products,
    storeInfo,
  };
};


const getSingleProduct = async (id: string, userId?: string) => {

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      B2BPackage: true,
      BundleOffer: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      shop: {
        select: {
          id: true,
          sellerId: true
        }
      },
      Varient: true,
      Review: {
        select: {
          id: true,
          comment: true,
          image: true,
          video: true,
          createdAt: true,
          rating: true,
          user: {
            select: {
              id: true,
              profileImage: true,
              fullName: true,
              email: true,
            }
          }
        }
      },
      productFaq: true
    },
  });

  if (userId) {
    const views = await prisma.view.findFirst({
      where: {
        productId: id,
        userId: userId,
      },
    });

    if (!views) {
      await prisma.view.create({
        data: {
          productId: id,
          userId: userId,
        },
      });
      await prisma.product.update({
        where: { id },
        data: {
          totalView: { increment: 1 },
        },
      });
    }
  }

  const moreProduct = await prisma.product.findMany({
    where: { isDeleted: false, storeId: product?.storeId, id: { not: id } },
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
    select: {
      id: true,
      productName: true,
      basePrice: true,
      avgRating: true,
      totalSale: true,
      productStatus: true,
      discountPrice: true,
      productPhoto: true,
      shop: {
        select: {
          sellerId: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      BundleOffer: true,
    },
  })

  const b2bPackageSection = (product?.B2BPackage ?? [])
    .map((pkg) => {
      const moq = pkg.moq || parseMOQ(pkg.quantity);

      if (!moq) {
        return {
          id: pkg.id,
          moq: pkg.quantity,
          quantity: pkg.quantity,
          totalPrice: pkg.price,
          pricePerUnit: pkg.pricePerUnit || null,
          b2bPackageTag: pkg.b2bPackageTag || null,
          maxMOQ: pkg.maxMOQ || null,
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
        };
      }

      const pricing = getB2BPackagePricing(moq);
      const fallbackUnitPrice = moq > 0 ? parseFloat((pkg.price / moq).toFixed(2)) : null;

      return {
        id: pkg.id,
        moq,
        quantity: String(moq),
        totalPrice: pkg.price,
        pricePerUnit: pkg.pricePerUnit || pricing?.pricePerUnit || fallbackUnitPrice,
        b2bPackageTag: pkg.b2bPackageTag || pricing?.b2bPackageTag || null,
        maxMOQ: pkg.maxMOQ || pricing?.maxMOQ || null,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
      };
    })
    .sort((a, b) => Number(a.moq) - Number(b.moq));

  return {
    product,
    b2bPackageSection,
    moreProduct,
  };
};

const updateProduct = async (id: string, payload: any) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  })
  const updateProduct = await prisma.product.update({
    where: { id },
    data: {
      productName: payload.productName,
      basePrice: payload.basePrice,
      discountPrice: payload.discountPrice,
      discountStartDate: payload.discountStartDate
        ? new Date(payload.discountStartDate)
        : undefined,
      discountEndTime: payload.discountEndTime
        ? new Date(payload.discountEndTime)
        : undefined,
      desc: payload.desc,
      productStatus: payload.productStatus,
      productDetails: payload.productDetails,
      categoryId: payload.categoryId,
      productPhoto: payload.productPhoto || existingProduct?.productPhoto,
      searchTag: payload.searchTag

    },
  });


  if (payload.productFaq?.length) {
    for (const faq of payload.productFaq) {
      if (faq.id) {
        await prisma.productFaq.update({
          where: { id: faq.id },
          data: {
            question: faq.question,
            answer: faq.answer,
          },
        });
      } else {
        await prisma.productFaq.create({
          data: {
            question: faq.question,
            answer: faq.answer,
            productId: id,
          },
        });
      }
    }
  }


  return updateProduct;
};


const updateVarients = async (varientId: string, varients: any) => {
  const data: any = {
    sku: varients.sku,
    stock: varients.stock,
    price: varients.price,
    attributes: varients.attributes,
  };

  if (varients.coupons?.length) {
    const existingCoupons = await prisma.varientCoupon.findMany({
      where: {
        varientId,
        couponId: { in: varients.coupons },
      },
      select: { couponId: true },
    });

    const existingCouponIds = existingCoupons.map(c => c.couponId);

    if (existingCouponIds.length === varients.coupons.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Coupons already exist for this variant");
    }

    const newCoupons = varients.coupons.filter(
      (couponId: string) => !existingCouponIds.includes(couponId)
    );

    if (newCoupons.length > 0) {
      data.varientCoupons = {
        create: newCoupons.map((couponId: string) => ({
          coupon: {
            connect: { id: couponId },
          },
        })),
      };
    }
  }

  const result = await prisma.varient.update({
    where: { id: varientId },
    data,
  });

  return result;
};



const updateBundleOffer = async (bundleId: string, bundles: any) => {
  const result = await prisma.bundleOffer.update({
    where: { id: bundleId },
    data: {
      quantity: bundles.quantity,
      discount: bundles.discount,
      bundleTag: bundles.bundleTag,
    },
  });

  return result;
};

const createBundleOffer = async (productId: string, bundles: any) => {
  const result = await prisma.bundleOffer.create({
    data: {
      productId,
      quantity: bundles.quantity,
      discount: bundles.discount,
      bundleTag: bundles.bundleTag,
    },
  });

  return result;
}

const deleteBundleOffer = async (bundleId: string) => {
  const result = await prisma.bundleOffer.delete({
    where: { id: bundleId },
  });

  return result;
}



const updateB2BPackage = async (b2bPackageId: string, packages: any) => {
  const moq = parseMOQ(packages.moq ?? packages.quantity);

  if (!moq) {
    throw new ApiError(httpStatus.BAD_REQUEST, "B2B MOQ must be a positive integer");
  }

  const pricing = getB2BPackagePricing(moq);
  if (!pricing) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid B2B MOQ tier");
  }

  const result = await prisma.b2BPackage.update({
    where: { id: b2bPackageId },
    data: {
      quantity: String(pricing.moq),
      price: pricing.totalPrice,
      moq: pricing.moq,
      maxMOQ: pricing.maxMOQ,
      pricePerUnit: pricing.pricePerUnit,
      b2bPackageTag: pricing.b2bPackageTag as PackageTag,
    },
  });

  return result;
};

const createB2BPackage = async (productId: string, packages: any) => {
  const moq = parseMOQ(packages.moq ?? packages.quantity);

  if (!moq) {
    throw new ApiError(httpStatus.BAD_REQUEST, "B2B MOQ must be a positive integer");
  }

  const pricing = getB2BPackagePricing(moq);
  if (!pricing) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid B2B MOQ tier");
  }


  const result = await prisma.b2BPackage.create({
    data: {
      productId,
      quantity: String(pricing.moq),
      price: pricing.totalPrice,
      moq: pricing.moq,
      maxMOQ: pricing.maxMOQ,
      pricePerUnit: pricing.pricePerUnit,
      b2bPackageTag: pricing.b2bPackageTag as PackageTag,
    },
  });

  return result;
}


const deleteB2BPackage = async (b2bPackageId: string) => {
  const result = await prisma.b2BPackage.delete({
    where: { id: b2bPackageId },
  });

  return result;
}



const deleteProduct = async (id: string) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id, isDeleted: false },
  });

  if (!existingProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
  await prisma.product.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });
  return;
};



export const productService = {
  updateProduct,
  createProduct,
  getMyProducts,
  getAllProducts,
  getSingleStoreProducts,
  updateVarients,
  updateBundleOffer,
  updateB2BPackage,
  getSingleProduct,
  deleteProduct,
  publishedProduct,
  createBundleOffer,
  deleteBundleOffer,
  createB2BPackage,
  deleteB2BPackage
};
