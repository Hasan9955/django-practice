import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { shareService } from "./share.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";



const createShare = catchAsync(async (req: Request, res: Response) => {

    const { postId } = req.body;
    console.log(postId);

    const result = await shareService.createShare(req.user.id, postId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Share created successfully",
        data: result,
    });
})


const getShares = catchAsync(async (req: Request, res: Response) => {
    const postId = req.params.postId
    const options = req.query;
    const result = await shareService.getShares(postId, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Share fetched successfully",
        data: result,
    });
})


export const shareController = {
    createShare,
    getShares
}