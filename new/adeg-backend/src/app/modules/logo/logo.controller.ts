// import { Request, Response } from "express";
// import catchAsync from "../../../shared/catchAsync";
// import { logoService } from "./logo.service";
// import sendResponse from "../../../shared/sendResponse";
// import { fileUploader } from "../../../helpers/fileUploader";
// import uploadToDigitalOcean from "../../../helpers/uploadToDigitalOcean";



// const createLogo = catchAsync(async (req: Request, res: Response) => {
//   const file = req.file;
//   let uploadedUrl: string | null = null;

//   if (file) {
//     uploadedUrl = await uploadToDigitalOcean(file);
//   }

//   const result = await logoService.createLogo(uploadedUrl);

//   sendResponse(res, {
//     statusCode: 201,
//     success: true,
//     message: "Logo created successfully",
//     data: result,
//   });
// });

// const getAllLogos = catchAsync(async (req: Request, res: Response) => {
//   const logos = await logoService.getAllLogos();
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Logos retrieved successfully",
//     data: logos,
//   });
// });

// const updateLogo = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const file = req.file;
//   let uploadedUrl: string | null = null;

//   if (file) {
//     uploadedUrl = await uploadToDigitalOcean(file);
//   }

//   const result = await logoService.updateLogo(id, uploadedUrl);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Logo updated successfully",
//     data: result,
//   });
// });

// export const logoController = {
//   createLogo,
//   getAllLogos,
//   updateLogo,
// };
