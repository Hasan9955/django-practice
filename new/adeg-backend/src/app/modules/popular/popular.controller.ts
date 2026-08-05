import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { popularService } from "./popular.service";
import sendResponse from "../../../shared/sendResponse";



const getMostPopularProducts = catchAsync(async (req: Request, res: Response) => { 
  const options = req.query;
  const result = await popularService.getMostPopularProducts(options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Most popular products retrieved successfully",
    data: result,
  });
});

const getMostPopularStore = catchAsync(async (req: Request, res: Response) => { 
  const options = req.query;
  const result = await popularService.getMostPopularStore(options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Most popular store retrieved successfully",
    data: result,
  });
});



export const popularController = {
  getMostPopularProducts,
  getMostPopularStore,

};