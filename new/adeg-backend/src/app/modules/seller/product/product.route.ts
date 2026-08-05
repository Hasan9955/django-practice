import express from "express";
import { productController } from "./product.controller";
import { fileUploader } from "../../../../helpers/fileUploader";
import { parseBodyData } from "../../../middlewares/parseBodyData";
import { UserRole } from "@prisma/client";
import auth, { optionalAuth } from "../../../middlewares/auth"; 
import {
  adminApiLimiter,
  fileUploadLimiter,
  publicApiLimiter,
} from "../../../middlewares/rateLimiter";

const router = express.Router();

router.post(
  "/create-product",
  auth(UserRole.SELLER, UserRole.ALL),
  adminApiLimiter,
  fileUploadLimiter,
  fileUploader.productImage,
  parseBodyData,
  productController.createProduct
);

router.patch(
  "/update-product/:productId",
  auth(UserRole.SELLER, UserRole.ALL),
  adminApiLimiter,
  fileUploadLimiter,
  fileUploader.productImage,
  parseBodyData,
  productController.updateProduct
);

router.patch(
  "/update-varient/:varientId",
  auth(UserRole.SELLER, UserRole.ALL),
  adminApiLimiter,
  productController.updateVarients
);
 
router.post(
  "/create-bundle-offer/:productId",
  auth(UserRole.SELLER, UserRole.ALL),
  adminApiLimiter,
  productController.createBundleOffer
);

router.delete(
  "/delete-bundle-offer/:bundleId",
  auth(UserRole.SELLER, UserRole.ALL),
  adminApiLimiter,
  productController.deleteBundleOffer
);

router.post(
  "/create-b2b-package/:productId",
  auth(UserRole.SELLER, UserRole.ALL),
  adminApiLimiter,
  productController.createB2BPackage
);

router.delete(
  "/delete-b2b-package/:b2bPackageId",
  auth(UserRole.SELLER, UserRole.ALL),
  adminApiLimiter,
  productController.deleteB2BPackage
);

router.patch(
  "/update-bundle-offer/:bundleId",
  auth(UserRole.SELLER, UserRole.ALL),
  adminApiLimiter,
  productController.updateBundleOffer
);

router.patch(
  "/update-b2b-package/:b2bPackageId",
  auth(UserRole.SELLER, UserRole.ALL),
  adminApiLimiter,
  productController.updateB2BPackage
);

router.get(
  "/my-products",
  auth(UserRole.SELLER, UserRole.ALL),
  adminApiLimiter,
  productController.getMyProducts
);

router.get("/all-products", publicApiLimiter, productController.getAllProducts);

router.get("/get-store-products/:storeId", publicApiLimiter, productController.getSingleStoreProducts);

router.get(
  "/single-product/:productId",
  optionalAuth(),
  publicApiLimiter,
  productController.getSingleProduct
);

router.delete(
  "/delete-product/:productId",
  auth(UserRole.SELLER, UserRole.ADMIN, UserRole.ALL),
  adminApiLimiter,
  productController.deleteProduct
);

router.patch(
  "/published-product/:productId",
  auth(UserRole.SELLER, UserRole.ADMIN, UserRole.ALL),
  adminApiLimiter,
  productController.publishedProduct
);

export const productRoute = router;
