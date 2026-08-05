import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { faqService } from "./faq.service";
import sendResponse from "../../../shared/sendResponse";


const getCmsContent = catchAsync(async (req: Request, res: Response) => {
  const result = await faqService.getCmsContent();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
    message: "CMS content fetched successfully"
  });
});


const createOrUpdatePrivacyFaqFooter = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  
  const result = await faqService.createOrUpdateCmsContent(payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
    message: "CMS content successfully updated"
  });
});

const deleteFaq = catchAsync(async (req: Request, res: Response) => {
  const faqId = req.params.faqId;
  const result = await faqService.deleteFaq(faqId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
    message: "FAQ deleted successfully"
  });
});


export const faqController = { getCmsContent, createOrUpdatePrivacyFaqFooter, deleteFaq };