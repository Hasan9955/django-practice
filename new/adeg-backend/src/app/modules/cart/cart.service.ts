import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";



const AddToCart = async (userId: string, productId: string, variantId: string, bundleId?: string) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!existingProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  const existingCart = await prisma.cart.findUnique({
    where: {
      userId_productId_variantId: {
        userId: userId,
        productId: productId,
        variantId: variantId
      },
    },
  });

  if (existingCart) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product already added to cart");
  }

  const cart = await prisma.cart.create({
    data: {
      userId: userId,
      productId: productId,
      variantId: variantId,
      bundleId: bundleId
    },
  });
  return cart;
};

const removeProductFromCart = async (userId: string, productId: string, variantId: string) => {
  const existingCart = await prisma.cart.findUnique({
    where: {
      userId_productId_variantId: {
        userId: userId,
        productId: productId,
        variantId: variantId
      },
    },
  });
  if (!existingCart) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not found in cart");
  }
  const cart = await prisma.cart.delete({
    where: {
      userId_productId_variantId: {
        userId: userId,
        productId: productId,
        variantId: variantId
      },
    },
  });
  return cart;
};


const removeSelectedProduct = async (userId: string, productIds: string[]) => {
  const existingProduct= await prisma.cart.findMany({
    where: {
      productId: {
        in: productIds,
      },
    },
  });

  if (existingProduct.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not found");
  }
  
  const existingCarts = await prisma.cart.findMany({
    where: {
      userId: userId,
      productId: {
        in: productIds
      }
    },
  });
  if (!existingCarts) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not found in cart");
  }
  const cart = await prisma.cart.deleteMany({
    where: {
      userId: userId,
      productId: {
        in: productIds
      }
    },
  })
  return;
}

const removeAllProductFromCart = async (userId: string) => {

  const existingCarts = await prisma.cart.findMany({
    where: {
      userId: userId,
    },
  });
  if (existingCarts.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not found in cart");
  }
 await prisma.cart.deleteMany({
    where: {
      userId: userId,
    },
 })
  return;
}


const getMyCartList = async (userId: string) => {
  const myCartList = await prisma.cart.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      userId: true,
      productId: true,
      product: {
        select: {
          id: true,
          productName: true,
          storeId: true,
          basePrice: true,
          discountPrice: true,
          productPhoto: true,
          shop: {
            select: {
              id: true,
            }
          }
        },
      },
      variant: {
        select: {
          id: true,
          sku: true,
          stock: true,
          price: true,
        },
      },
      bundle: {
        select: {
          id: true,
          quantity: true,
          discount: true,
        },
      },
    },
  });
  return myCartList;
};


export const CartServices = {
  AddToCart,
  removeProductFromCart,
  removeSelectedProduct,
  removeAllProductFromCart,
  getMyCartList,
};
