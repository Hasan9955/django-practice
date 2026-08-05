import httpStatus from "http-status";
import { Request, Response } from "express";
import { CommentServices } from "./comment.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";



const createComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentServices.createComment(req.user.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment created successfully",
    data: result,
  });
})


const getAllCommentsByNicheHubId = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentServices.getAllCommentsByNicheHubId(req.params.nicheHubId, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comments fetched successfully",
    data: result,
  });
})


export const  CommentControllers = {
  createComment,
  getAllCommentsByNicheHubId
};
