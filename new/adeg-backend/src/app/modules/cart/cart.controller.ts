import httpStatus from "http-status";
import { Request, Response } from "express";
import { CartServices } from "./cart.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";


const addToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const {productId, variantId, bundleId} = req.body;
  const result = await CartServices.AddToCart(userId, productId, variantId, bundleId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product added to cart successfully",
    data: result,
  });
});


const removeProductFromCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const {productId, variantId, bundleId} = req.body;
  const result = await CartServices.removeProductFromCart(userId, productId, variantId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product removed from cart successfully",
    data: result,
  });
});

const removeSelectedProduct = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const productIds = req.body.productIds;
  const result = await CartServices.removeSelectedProduct(userId, productIds);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specific product removed from cart successfully",
    data: result,
  });
});

const removeAllProductFromCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await CartServices.removeAllProductFromCart(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All product removed from cart successfully",
    data: result,
  });
});

const getMyCartList = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await CartServices.getMyCartList(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart list fetched successfully",
    data: result,
  });
});


export const CartControllers = {
  addToCart,
  removeProductFromCart,
  removeSelectedProduct,
  removeAllProductFromCart,
  getMyCartList,
};
