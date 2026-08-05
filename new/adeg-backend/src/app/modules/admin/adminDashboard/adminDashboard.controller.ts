import { Request, Response } from "express";
import catchAsync from "../../../../shared/catchAsync";
import { adminDashboardService, ISellerSubscriptionFilters } from "./adminDashboard.service";
import sendResponse from "../../../../shared/sendResponse";
import httpStatus from "http-status";
import { marketPlaceHealthService } from "./marketPlaceHelth.service"; 


const getAllSellerList = catchAsync(async (req: Request, res: Response) => {
  const result = await adminDashboardService.getAllSellerList(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Seller list fetched successfully",
    data: result,
  });
});


const getAllOrderList = catchAsync(async (req: Request, res: Response) => {
  const result = await adminDashboardService.getAllOrderList(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All order list fetched successfully",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.params.sellerId
  const result = await adminDashboardService.getAllProducts(sellerId, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products data fetched successfully",
    data: result,
  });
});

const sellerPerformanceData = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.params.sellerId
  const result = await adminDashboardService.sellerPerformanceData(sellerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller performance data fetched successfully",
    data: result,
  });
});

const getOrderTableData = catchAsync(async (req: Request, res: Response) => {
  const options = req.query
  const sellerId = req.params.sellerId
  const result = await adminDashboardService.getOrderTableData(sellerId, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller performance order table data fetched successfully",
    data: result,
  });
});

const sellInsightChartData = catchAsync(async (req: Request, res: Response) => {
  const options = req.query
  const sellerId = req.params.sellerId
  const result = await adminDashboardService.sellInsightChartData(sellerId, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller sell insight chart data fetched successfully",
    data: result,
  });
});


const getSalesInsightsByRegion = catchAsync(async (req: Request, res: Response) => {
  const options = req.query
  const result = await adminDashboardService.getSalesInsightsByRegion();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sales insight by region chart data fetched successfully",
    data: result,
  });
});


const getMarketPlaceHealthData = catchAsync(async (req: Request, res: Response) => {
  const options = req.query
  const result = await marketPlaceHealthService.getMarketPlaceHealthData();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Market place health data fetched successfully",
    data: result,
  });
});

const getNewlyListedProducts = catchAsync(async (req: Request, res: Response) => { 
  const result = await marketPlaceHealthService.getNewlyListedProducts();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New listed products data fetched successfully",
    data: result,
  });
});

const getMarketPlaceRevenueChartData = catchAsync(async (req: Request, res: Response) => {
  const options = req.query
  const result = await marketPlaceHealthService.getMarketPlaceRevenueChartData(options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Market place Revenue chart data fetched successfully",
    data: result,
  });
});

const marketPlaceHealthSalesChartData = catchAsync(async (req: Request, res: Response) => {
  let options = req.query.filter as string;

  const allowedOptions = ["12months", "30days", "7days", "24hours"];
  if (!allowedOptions.includes(options)) {
    options = "12months";
  }
  const result = await marketPlaceHealthService.marketPlaceHealthSalesChartData(options as "12months" | "30days" | "7days" | "24hours");
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Market place health sales chart data fetched successfully",
    data: result,
  });
});

const getAllSubscribedSellers = catchAsync(async (req: Request, res: Response) => {
 
  const result = await adminDashboardService.getAllSellerSubscriptions(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscribed sellers data fetched successfully",
    data: result,
  });
});



export const adminDashboardController = {
  getAllSellerList,
  getAllProducts,
  sellerPerformanceData,
  getOrderTableData,
  sellInsightChartData,
  getSalesInsightsByRegion,
  getMarketPlaceHealthData,
  getMarketPlaceRevenueChartData,
  marketPlaceHealthSalesChartData,
  getNewlyListedProducts,
  getAllOrderList,
  getAllSubscribedSellers
}