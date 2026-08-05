import { Request ,Response} from "express";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { productService } from "./product.service";
import uploadToDigitalOcean from "../../../../helpers/uploadToDigitalOcean";
import ApiError from "../../../../errors/ApiErrors";
import httpStatus from "http-status";


const createProduct = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  let imageUrls: string[] = [];

  if (req.files) {

    const filesArray = Array.isArray(req.files)
      ? (req.files as Express.Multer.File[])
      : Object.values(req.files).flat() as Express.Multer.File[];

    const uploadPromises = filesArray.map(file => uploadToDigitalOcean(file));
    imageUrls = await Promise.all(uploadPromises);
  }


  payload.productPhoto = imageUrls;

  const data = await productService.createProduct(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product created successfully",
    data,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const payload = req.body;
  const uerId = req.user.id;
  const existingProduct = await productService.getSingleProduct(productId, uerId);

  if (!existingProduct?.product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  let imageUrls = existingProduct.product.productPhoto || [];

  if (req.files && Object.keys(req.files).length > 0) {
    const filesArray: Express.Multer.File[] = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files).flat() as Express.Multer.File[];

    const uploadedUrls = await Promise.all(filesArray.map(file => uploadToDigitalOcean(file)));

    imageUrls = uploadedUrls;
  }


  payload.productPhoto = imageUrls;

  const updatedProduct = await productService.updateProduct(productId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  });
});

const updateVarients = catchAsync(async (req: Request, res: Response) => {
  const varientId = req.params.varientId;
  const payload = req.body;
  const data = await productService.updateVarients(varientId, payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product varients updated successfully",
    data,
  });
});

// createBundleOffer,
//   deleteBundleOffer,
//   createB2BPackage,
//   deleteB2BPackage
const createBundleOffer = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const payload = req.body;
  const data = await productService.createBundleOffer(productId, payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product bundle offer created successfully",
    data,
  });
});

const deleteBundleOffer = catchAsync(async (req: Request, res: Response) => {
  const bundleId = req.params.bundleId;
  const data = await productService.deleteBundleOffer(bundleId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product bundle offer deleted successfully",
    data,
  });
});

const createB2BPackage = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const payload = req.body;
  const data = await productService.createB2BPackage(productId, payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product b2b package created successfully",
    data,
  });
});

const deleteB2BPackage = catchAsync(async (req: Request, res: Response) => {
  const packageId = req.params.b2bPackageId;
  const data = await productService.deleteB2BPackage(packageId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product b2b package deleted successfully",
    data,
  });
});


const updateBundleOffer = catchAsync(async (req: Request, res: Response) => {
  const bundleId = req.params.bundleId;
  const payload = req.body;
  const data = await productService.updateBundleOffer(bundleId, payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product bundle offer updated successfully",
    data,
  });
});



const getMyProducts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const data = await productService.getMyProducts(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product fetched successfully",
    data,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const options = req.query;
  const data = await productService.getAllProducts(options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product fetched successfully",
    data,
  });
});


const getSingleStoreProducts  = catchAsync(async (req: Request, res: Response) => {
  const storeId = req.params.storeId;
  const options = req.query;
  const result = await productService.getSingleStoreProducts(storeId, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Store products retrieved successfully",
    data: result,
  });
});


const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const userId = req?.user?.id;
  const data = await productService.getSingleProduct(productId,userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product fetched successfully",
    data,
  });
});

const updateB2BPackage = catchAsync(async (req: Request, res: Response) => {
  const b2bPackageId = req.params.b2bPackageId;
  const payload = req.body;
  const data = await productService.updateB2BPackage(b2bPackageId, payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "B2B package updated successfully",
    data,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const data = await productService.deleteProduct(productId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product deleted successfully",
    data,
  });
});

const publishedProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const data = await productService.publishedProduct(productId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product published successfully",
    data,
  });
});

export const productController = {
  createProduct,
  updateProduct,
  getMyProducts,
  updateVarients,
  getAllProducts,
  getSingleStoreProducts,
  updateBundleOffer,
  getSingleProduct,
  updateB2BPackage,
  deleteProduct,
  publishedProduct,
  createBundleOffer,
  deleteBundleOffer,
  createB2BPackage,
  deleteB2BPackage
};