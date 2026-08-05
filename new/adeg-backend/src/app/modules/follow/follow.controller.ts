import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { FollowServices } from "./follow.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";



const createFollow = catchAsync(async (req: Request, res: Response) => {
    const {storeId} = req.body; 
  const result = await FollowServices.createFollow(req.user.id, storeId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Follow created successfully",
    data: result,
  });
})

const getMyFollowings = catchAsync(async (req: Request, res: Response) => {
    const result = await FollowServices.getMyFollowings(req.user.id);
    sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Follow fetched successfully",
    data: result,
  });
})

const getStoreFollower = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.storeId;
    const result = await FollowServices.getStoreFollower(storeId);
    sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Follow fetched successfully",
    data: result,
  });
})


export const followController = {
    createFollow,
    getMyFollowings,
    getStoreFollower
};
