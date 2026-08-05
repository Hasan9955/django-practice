import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { adminService } from "./admin.service";
import uploadToDigitalOcean from "../../../helpers/uploadToDigitalOcean";
import { deleteFromDigitalOcean } from "../../../helpers/deleteFromDigitalOccean";
import { platformUpdateSchema } from "./admin.validation";
import { constructFromSymbol } from "date-fns/constants";
import Api from "twilio/lib/rest/Api";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.createUser(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User created successfully",
    data: result,
  });
});

const loginAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.loginAdmin(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "admin successfully logged in",
    data: result,
  });
});
const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const result = await adminService.getAllUser(
    Number(page) || 1,
    Number(limit) || 10,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "all user get successfully",
    data: result,
  });
});

const platformUpdate = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const uploadedUrls: { [key: string]: string | string[] } = {};

  const parsed = platformUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid input data",
      errors: parsed.error.format(),
    });
  }
  const payload = parsed.data;

  try {
    if (files?.logo?.[0]) {
      const logoUrl = await uploadToDigitalOcean(files.logo[0]);
      uploadedUrls.logo = logoUrl;
      payload.logo = logoUrl;
    }

    if (payload.banners && payload.banners.length > 0) {
      const bannerFiles = files?.banner || [];

      if (payload.banners.length !== bannerFiles.length) {
        throw new ApiError(
          httpStatus.NOT_ACCEPTABLE,
          `Mismatched input: You provided ${payload.banners.length} banner details but uploaded ${bannerFiles.length} images.`,
        );
      }

      if (bannerFiles.length > 0) {
        const bannerUrls = await Promise.all(
          bannerFiles.map(uploadToDigitalOcean),
        );
        uploadedUrls.banner = bannerUrls;

        payload.banners = bannerUrls.map((url, i) => ({
          bannerUrl: url,
          title: payload.banners?.[i]?.title || "",
          description: payload.banners?.[i]?.description || "",
        }));
      }
    }

    if (files?.categoryImage?.length > 0 && payload.categories?.length) {
      const categoryUrls = await Promise.all(
        files.categoryImage.map(uploadToDigitalOcean),
      );
      uploadedUrls.categoryImage = categoryUrls;

      payload.categories = payload.categories.map((cat, i) => ({
        ...cat,
        categoryPhoto: categoryUrls[i],
      }));
    }

    if (files.crmBanner) {
      const crmBanner = await uploadToDigitalOcean(files.crmBanner[0] as any);
      payload.bannerImage = crmBanner;
    }
    const result = await adminService.platformUpdate(payload);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Platform updated successfully",
      data: result,
    });
  } catch (error) {
    // Rollback any uploaded files
    await Promise.all(
      Object.values(uploadedUrls)
        .flat()
        .map((url: string) =>
          deleteFromDigitalOcean(url).catch((err) =>
            console.error(`❌ Failed to delete file: ${url}`, err),
          ),
        ),
    );
    throw error;
  }
});

const getAllPlatformData = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllPlatformData(
    req.query.platformId as string,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "platform data get successfully6",
    data: result,
  });
});

const getPlatformDataForUser = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getPlatformDataForUser(
      req.query.platformId as string,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "platform data get successfully6",
      data: result,
    });
  },
);

const getAllUserAsAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllUserAsAdmin(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "all user get successfully",
    data: result,
  });
});

const updateRole = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.body;
  const result = await adminService.updateUserRole(userId, role);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Role updated successfully",
    data: result,
  });
});

const updateSingleCategory = catchAsync(async (req: Request, res: Response) => {
  let url = "";
  try {
    if (req.file) {
      url = await uploadToDigitalOcean(req.file);

      req.body.categoryPhoto = url;
    }
    const result = await adminService.updateSingleCategory(
      req.params.categoryId,
      req.body,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "category update successfully",
      data: result,
    });
  } catch (error) {
    if (url) {
      deleteFromDigitalOcean(url).catch((err) =>
        console.error(`❌ Failed to delete file: ${url}`, err),
      );
    }

    throw error;
  }
});

const deleteSingleCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.deleteSingleCategory(req.params.categoryId);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category Delete successfully",
    data: result,
  });
});

export const adminController = {
  loginAdmin,
  getAllUser,
  createUser,
  platformUpdate,
  getAllPlatformData,
  getPlatformDataForUser,
  getAllUserAsAdmin,
  updateRole,
  updateSingleCategory,
  deleteSingleCategory,
};
