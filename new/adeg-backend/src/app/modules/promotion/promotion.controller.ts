import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import uploadToDigitalOcean from "../../../helpers/uploadToDigitalOcean";
import sendResponse from "../../../shared/sendResponse";
import { promotionService } from "./promotion.service";


const createPromotion = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  const payload = req.body;
  const result = await promotionService.createPromotion(file, payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Promotion created successfully",
    data: result,
  });
});

const getAllPromotion = catchAsync(async (req: Request, res: Response) => { 
  const result = await promotionService.getAllPromotion();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Promotion retrieved successfully",
    data: result,
  });
});

const getSinglePromotion = catchAsync(async (req: Request, res: Response) => { 
  const promotionId = req.params.promotionId;
  const result = await promotionService.getSinglePromotion(promotionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Promotion retrieved successfully",
    data: result,
  });
});

const updatePromotion = catchAsync(async (req: Request, res: Response) => { 
  const promotionId = req.params.promotionId;
  const file = req.file;
  const payload = req.body;
  const result = await promotionService.updatePromotion(promotionId, file, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Promotion updated successfully",
    data: result,
  });
});


const deletePromotion = catchAsync(async (req: Request, res: Response) => { 
  const promotionId = req.params.promotionId;
  const result = await promotionService.deletePromotion(promotionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Promotion deleted successfully",
    data: result,
  });
});


export const promotionController = {
  createPromotion,
  getAllPromotion,
  getSinglePromotion,
  updatePromotion,
  deletePromotion
};