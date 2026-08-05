import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { bannerService } from "./banner.service";
import sendResponse from "../../../shared/sendResponse";
import uploadToDigitalOcean from "../../../helpers/uploadToDigitalOcean";



// const createBanner = catchAsync(async (req: Request, res: Response) => {
//   const file = req.file;
//   let uploadedUrl: string | null = null;

//   if (file) {
//     uploadedUrl = await uploadToDigitalOcean(file);
//   }
//   const payload = req.body;


//   const result = await bannerService.createBanner(uploadedUrl, payload);

//   sendResponse(res, {
//     statusCode: 201,
//     success: true,
//     message: "Banner created successfully",
//     data: result,
//   });
// });

const getAllBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await bannerService.getAllBanner();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Banner retrieved successfully",
    data: result,
  });
});

const updateBanner = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = req.file;
  let uploadedUrl: string | null = null;

  if (file) {
    uploadedUrl = await uploadToDigitalOcean(file);
  }
  const payload = req.body;

  const result = await bannerService.updateBanner(id,payload, uploadedUrl);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Banner updated successfully",
    data: result,
  });
});

const delteBanner = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await bannerService.delteBanner(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Banner deleted successfully",
    data: result,
  });
});

export const bannerController = {
  getAllBanner,
  updateBanner,
  delteBanner
};
