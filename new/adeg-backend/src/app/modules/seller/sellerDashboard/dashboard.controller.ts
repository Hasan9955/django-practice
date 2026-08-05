import { Request, Response } from "express";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import httpStatus from "http-status";
import { sellerDashboardService } from "./dashboard.service";
import { get } from "http";



const createShippingOptions = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await sellerDashboardService.createShippingOptions(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Shipping options created successfully",
    data: result,
  });
});


const getSellerDashboardData = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const result = await sellerDashboardService.getSellerDashboardData(sellerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller dashboard data fetched successfully",
    data: result,
  });
});


const getSellerPaymentData = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const options = req.query
  const result = await sellerDashboardService.getSellerPaymentData(sellerId, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller payment data fetched successfully",
    data: result,
  });
});

const getSellerRevenueAnalytics = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const options = req.query
  const result = await sellerDashboardService.getSellerRevenueAnalytics(sellerId, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller revenue data fetched successfully",
    data: result,
  });
});

const getSellerSalesAnalytics = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const options = req.query
  const result = await sellerDashboardService.getSellerSalesAnalytics(sellerId, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller sales analytics data fetched successfully",
    data: result,
  });
});

const getShoppingOptionsByStoreId = catchAsync(async (req: Request, res: Response) => {
  const storeId = req.params.storeId; 
  const result = await sellerDashboardService.getShoppingOptionsByStoreId(storeId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Shopping options fetched successfully",
    data: result,
  });
});



export const sellerDashboardController = {
  getSellerDashboardData,
  getSellerPaymentData,
  getSellerRevenueAnalytics,
  getSellerSalesAnalytics,
  createShippingOptions,
  getShoppingOptionsByStoreId
};