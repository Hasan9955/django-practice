import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ReviewService } from "./review.service";
import httpStatus from "http-status";



const addProductReview = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.orderId
    const payload = req.body
    const files = req.files
    const userId = req.user.id 
    console.log(files)
  const result = await ReviewService.addProductReview(orderId, payload, files, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});


const getProductReviews = catchAsync(async (req: Request, res: Response) => {
    const productId = req.params.productId
    const options = req.query
  const result = await ReviewService.getProductReviews(productId, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product reviews fetched successfully",
    data: result,
  });
});


const getSellerReviews = catchAsync(async (req: Request, res: Response) => {
    const sellerId = req.user.id;
    const options = req.query;
  const result = await ReviewService.getSellerReviews(sellerId, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Seller reviews fetched successfully",
    data: result,
  });
});


const getUserReviews = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const options = req.query
  const result = await ReviewService.getUserReviews(userId, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User reviews fetched successfully",
    data: result,
  });
});


const updateReview = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id
    const payload = req.body
  const result = await ReviewService.updateReview(userId, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});


const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const reviewId = req.params.reviewId
  const result = await ReviewService.deleteReview(reviewId, req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});




export const ReviewController = {
    addProductReview,
    getProductReviews,
    getSellerReviews,
    getUserReviews,
    updateReview,
    deleteReview,
};