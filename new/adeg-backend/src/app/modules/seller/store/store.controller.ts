import { Request ,Response} from "express";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";

import uploadToDigitalOcean from "../../../../helpers/uploadToDigitalOcean";
import { storeService } from "./store.service";
import { deleteFromDigitalOcean } from "../../../../helpers/deleteFromDigitalOccean";

const updateStore = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const payload = req.body;
  payload.sellerId=req.user.id
  const uploadedUrls: string[] = [];

  try {
  
    if (files?.shopLogo?.[0]) {
      const logoUrl = await uploadToDigitalOcean(files.shopLogo[0]);
      payload.shopLogo = logoUrl;
      uploadedUrls.push(logoUrl); 
    }

  
    if (files?.bannerImage?.[0]) {
      const bannerUrl = await uploadToDigitalOcean(files.bannerImage[0]);
      payload.bannerImage = bannerUrl;
      uploadedUrls.push(bannerUrl); 
    }

   
    const result = await storeService.updateStore(payload);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "store updated successfully",
      data: result,
    });
  } catch (error) {
 
    await Promise.all(
      uploadedUrls.map((url) =>
        deleteFromDigitalOcean(url).catch((err) =>
          console.error(`❌ Failed to delete file: ${url}`, err)
        )
      )
    );

    throw error;
  }
});

const getUserStore = catchAsync(async (req: Request, res: Response) => {
  const storeId = req.params.storeId;
  const userId = req?.user?.id;
  const result = await storeService.getUserStore(storeId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "store retrieved successfully",
    data: result,
  });
});

const getSingleStore = catchAsync(async (req: Request, res: Response) => {
  const slug = req.params.slug.trim();
  const userId = req?.user?.id;
  const result = await storeService.getSingleStore(slug, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "store retrieved successfully",
    data: result,
  });
});

const getMystore = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const result = await storeService.getMystore(sellerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "store retrieved successfully",
    data: result,
  });
});

const getAllStore = catchAsync(async (req: Request, res: Response) => {
  const result = await storeService.getAllStore(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "store retrieved successfully",
    data: result,
  });
});

const getAllStoreForUser = catchAsync(async (req: Request, res: Response) => {
  const result = await storeService.getAllStoreForUser(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "store retrieved successfully",
    data: result,
  });
});

const subscribeStore = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user.id;
  
  const result = await storeService.subscribeStore(userId, payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "store subscribed successfully",
    data: result,
  });
});

const updateStoreStatus  = catchAsync(async (req: Request, res: Response) => {
  const result = await storeService.updateStoreStatus(req.params.id, req.body.status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "store status updated successfully",
    data: result,
  });
});

export const storeController = {
  updateStore,
  getMystore,
  getAllStore,
  getUserStore,
  subscribeStore,
  getSingleStore,
  getAllStoreForUser,
  updateStoreStatus
};