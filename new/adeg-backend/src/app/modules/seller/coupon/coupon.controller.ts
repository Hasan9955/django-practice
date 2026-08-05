import { Request ,Response} from "express";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { couponService } from "./coupon.service";


const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await couponService.createCoupon(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon created successfully",
    data: result,
  });
});

const getAllCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await couponService.getAllCoupon(req.params.storeId, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon fetched successfully",
    data: result,
  });
});

const getAllCouponAsAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await couponService.getAllCouponAsAdmin(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon fetched successfully",
    data: result,
  });
});

const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await couponService.updateCoupon(req.user.id ,req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon updated successfully",
    data: result,
  });
});

const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await couponService.deleteCoupon(req.user.id ,req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon deleted successfully",
    data: result,
  });
});

const applyCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await couponService.applyCoupon(req.body.code, req.body.variants);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon applied successfully",
    data: result,
  });
});

export const couponController = {
  createCoupon,
  getAllCoupon,
  getAllCouponAsAdmin,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
};