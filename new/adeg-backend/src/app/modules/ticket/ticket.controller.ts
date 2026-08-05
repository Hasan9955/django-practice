import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { TicketService } from "./ticket.service";
import sendResponse from "../../../shared/sendResponse";


const createTicketIntoDB = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as string;
  const payload = req.body;
  const result = await TicketService.createTicketIntoDB(payload, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
    message: "Ticket created successfully"
  });
});

const getAllTicketConversation = catchAsync(async (req: Request, res: Response) => {
  const options = req.query;
  const result = await TicketService.getAllTicketConversation(options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
    message: "Ticket conversation fetched successfully"
  });
});

const getMyTicketConversation = catchAsync(async (req: Request, res: Response) => {
  const options = req.query;
  const userId = req.user.id;
  const result = await TicketService.getMyTicketConversation(userId, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
    message: "Ticket conversation fetched successfully"
  });
}); 



const markMessagesAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as string;
  const ticketId = req.params.ticketId as string;
  const result = await TicketService.markMessagesAsRead(userId, ticketId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});


const getSingleMessageList = catchAsync(async (req: Request, res: Response) => {
  let { page = 1, limit = 20 } = req.query;
  const ticketId = req.params.ticketId as string;
  page = Number(page);
  limit = Number(limit);
  const result = await TicketService.getMergedMessageList(
    ticketId,
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

const updateTicketStatus = catchAsync(async (req: Request, res: Response) => {
  const { ticketId, status } = req.body;
  const result = await TicketService.updateTicketStatus(ticketId, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
    message: "Ticket status updated successfully"
  });
});





export const TicketController = {
  createTicketIntoDB,
  getAllTicketConversation,
  getMyTicketConversation,
  markMessagesAsRead,
  getSingleMessageList,
  updateTicketStatus
}
