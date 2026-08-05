import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { B2BPortalService } from "./b2bPortal.service";
import sendResponse from "../../../shared/sendResponse";

const getAllB2BPackages = catchAsync(async (req: Request, res: Response) => {
  const options = req.query;
  const result = await B2BPortalService.getAllB2BPackages(options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
    message: "B2B packages fetched successfully",
  });
});

const getB2BDashboardStatics = catchAsync(
  async (req: Request, res: Response) => {
    const result = await B2BPortalService.getB2bDashboardStatics();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
      message: "B2B dashboard static fetched successfully",
    });
  },
);

const getB2BPackagesBySellerId = catchAsync(
  async (req: Request, res: Response) => {
    const options = req.query;
    const sellerId = req.user.id;
    const result = await B2BPortalService.getB2BPackagesBySellerId(
      sellerId,
      options,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
      message: "B2B seller packages fetched successfully",
    });
  },
);

const getB2BConversationList = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await B2BPortalService.getB2BConversationList(
      userId,
      page,
      limit,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
      message: "B2B seller conversation list fetched successfully",
    });
  },
);

const getB2bDashboardChartData = catchAsync(
  async (req: Request, res: Response) => {
    const result = await B2BPortalService.getB2bDashboardChartData();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
      message: "B2B dashboard chart fetched successfully",
    });
  },
);

const getB2BDashboardListing = catchAsync(
  async (req: Request, res: Response) => {
    const result = await B2BPortalService.getB2BDashboardListing(req.query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
      message: "B2B dashboard list fetched successfully",
    });
  },
);

export const B2BPortalController = {
  getAllB2BPackages,
  getB2BDashboardStatics,
  getB2BPackagesBySellerId,
  getB2BConversationList,
  getB2bDashboardChartData,
  getB2BDashboardListing,
};
