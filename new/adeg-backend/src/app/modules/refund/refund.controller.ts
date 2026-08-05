import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { refundServices } from "./refund.service";
import sendResponse from "../../../shared/sendResponse";




const createRefundConversation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as string;
  const payload = req.body;
  const result = await refundServices.createRefundConversation(payload, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Refund conversation created successfully",
    data: result
  });
});

const getRefundConversationListIntoDB = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as string;
  const options = req.query;
  const result = await refundServices.getRefundConversationListIntoDB(userId, options as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Refund conversation retrieved successfully",
    data: result
  });
});

const getRefundConversationListForAdmin = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as string;
  const options = req.query;
  const result = await refundServices.getRefundConversationListForAdmin(options as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Refund conversation retrieved successfully",
    data: result
  });
});


const markMessagesAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as string;
  const refundConversationId = req.params.refundConversationId as string;
  const result = await refundServices.markMessagesAsRead(userId, refundConversationId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});


const getSingleMessageList = catchAsync(async (req: Request, res: Response) => {
  let { page = 1, limit = 20 } = req.query;
  const refundId = req.params.refundId as string;
  page = Number(page);
  limit = Number(limit);
  const result = await refundServices.getMergedMessageList(
    refundId,
    req.user.id,
    page,
    limit
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Message retrieved successfully",
    data: result.messages,
    meta: result.meta,
  });
});



const updateRefundStatus = catchAsync(async (req: Request, res: Response) => {
  const { refundId, status } = req.body;
  const result = await refundServices.updateRefundStatus(refundId, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
    message: "Refund status updated successfully"
  });
});


export const RefundController = {
  createRefundConversation,
  getRefundConversationListIntoDB,
  markMessagesAsRead,
  getSingleMessageList,
  updateRefundStatus,
  getRefundConversationListForAdmin
};