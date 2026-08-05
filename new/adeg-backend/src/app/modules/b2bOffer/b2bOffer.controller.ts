import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { b2bService } from "./b2bOffer.service";

const createB2bOffer = catchAsync(async (req: Request, res: Response) => {
  req.body.sellerId = req.user.id;
  const response = await b2bService.createB2bOffer(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "offer  create  successfully",
    data: response,
  });
});

const updateB2BOffer = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const response = await b2bService.updateB2BOffer(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "offer  updated  successfully",
    data: response,
  });
});

const getMyB2BOrders = catchAsync(async (req: Request, res: Response) => {
  const response = await b2bService.getMyB2BOrders(req.user.id);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "My B2B orders retrieved successfully",
    data: response,
  });
});

export const b2bOfferControler = {
  createB2bOffer,
  updateB2BOffer,
  getMyB2BOrders,
};
