import httpStatus from "http-status";
import { Request, Response } from "express";
import { LikeServices } from "./like.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";


const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const result = await LikeServices.toggleLike(req.user.id, req.params.nicheHubId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Like action successfully",
    data: result,
  })
})

const seeAllLikeUser = catchAsync(
  async (req: Request, res: Response) => {
    const result = await LikeServices.seeAllLikeUser(
      req.params.nicheHubId,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Like users retrieved successfully",
      data: result,
    });
  }
);




export const LikeControllers = {
  toggleLike,
  seeAllLikeUser,
};
