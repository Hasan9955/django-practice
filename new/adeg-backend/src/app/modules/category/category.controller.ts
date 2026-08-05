import httpStatus from "http-status";
import { CategoryServices } from "./category.service";
import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
// import uploadToDigitalOcean from "../../../helpers/uploadToDigitalOcean";

const getAllCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.getAllCategory();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category fetched successfully",
    data: result,
  });
});

const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.categoryId;
  const result = await CategoryServices.getSingleCategory(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category retrieved successfully",
    data: result,
  });
});

// const deleteSubCategory = catchAsync(async (req: Request, res: Response) => {
//   const id = req.params.categoryId;
//   const result = await CategoryServices.deleteCategory(id);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Category deleted successfully",
//     data: result,
//   });
// });

// const updateCategory = catchAsync(async (req: Request, res: Response) => {
//   const id = req.params.categoryId;
//   const file = req.file;
//   const name = req.body.name;
//   let uploadedUrl: string | null = null;
//   if (file) {
//     uploadedUrl = await uploadToDigitalOcean(file);
//   }
//   const result = await CategoryServices.updateCategory(id, name, uploadedUrl);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Category updated successfully",
//     data: result,
//   });
// });

export const CategoryControllers = {
    getSingleCategory,
  getAllCategory,
    // deleteSubCategory,
    // updateCategory,
};
