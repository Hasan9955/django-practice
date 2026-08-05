import httpStatus from "http-status";
import { Request, Response } from "express";
import { nicheHubServices } from "./nicheHub.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserRole } from "@prisma/client";


const createNicheHubPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const payload = req.body;
  const files = req.files;

  const result = await nicheHubServices.createNicheHubPost(userId, payload, files);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "NicheHub post created successfully",
    data: result,
  });
});

const getAllNicheHubPosts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const options = req.query;
  let result = null;
  if(req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUB_ADMIN) {
    result = await nicheHubServices.getAllNicheHubDataForAdmin(userId, options);
  } else {
    result = await nicheHubServices.getAllNicheHubPosts(userId, options);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "NicheHub posts fetched successfully",
    data: result,
  });
});
 

const deleteNicheHubPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const id = req.params.id;
  const result = await nicheHubServices.deleteNicheHubPost(id, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "NicheHub post deleted successfully",
    data: result,
  });
});

const updateNicheHubPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const id = req.params.id;
  const payload = req.body;
  const files = req.files;
  const result = await nicheHubServices.updateNicheHubPost(id, userId, payload, files);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "NicheHub post updated successfully",
    data: result,
  });
});

const getSingleNicheHubPost = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.id;
  const result = await nicheHubServices.getSingleNicheHubPost(postId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "NicheHub post fetched successfully",
    data: result,
  });
});


const voteInPoll = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { pollId, optionId } = req.body;
  const result = await nicheHubServices.voteInPoll(pollId, optionId, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Poll voted successfully",
    data: result,
  });
});


const reportPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { postId, reason, reasonType } = req.body;
  const result = await nicheHubServices.reportPost(postId, userId, reason, reasonType);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post reported successfully",
    data: result,
  });
});

const blockAUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const blockedId = req.params.id;
  const result = await nicheHubServices.blockAUser(userId, blockedId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User blocked successfully",
    data: result,
  });
});

// deleteNicheHubPostByAdmin,
//   updateVisibilityByAdmin

const deleteNicheHubPostByAdmin = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.id;
  const result = await nicheHubServices.deleteNicheHubPostByAdmin(postId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post deleted successfully",
    data: result,
  });
});

 

export const nicheHubControllers = {
  createNicheHubPost,
  getAllNicheHubPosts,
  deleteNicheHubPost,
  updateNicheHubPost,
  getSingleNicheHubPost,
  voteInPoll,
  reportPost,
  blockAUser,
  deleteNicheHubPostByAdmin, 
};
