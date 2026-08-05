import express from "express";

import validateRequest from "../../middlewares/validateRequest";

import { authValidation } from "../auth/auth.validation";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpers/fileUploader";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { adminController } from "./admin.controller";
import { authController } from "../auth/auth.controller";
import {
  adminApiLimiter,
  authLimiter,
  fileUploadLimiter,
} from "../../middlewares/rateLimiter";

const router = express.Router();

router.post(
  "/admin-login",
  authLimiter,
  validateRequest(authValidation.authLoginSchema),
  adminController.loginAdmin
);

router.get("/get-all-user-as-admin", auth(UserRole.ADMIN), adminApiLimiter, adminController.getAllUserAsAdmin);

router.post(
  "/create-user",
  auth(UserRole.ADMIN),
  authLimiter,
  adminController.createUser
);

//user route
router.get("/get-all-user", auth(UserRole.ADMIN), adminApiLimiter, adminController.getAllUser);

router.patch(
  "/update-platform",
  auth(UserRole.ADMIN),
  adminApiLimiter,
  fileUploadLimiter,
  fileUploader.uploadPlatformImage,
  parseBodyData,
  adminController.platformUpdate
);


router.get("/get-platfrom-data", auth(UserRole.ADMIN, UserRole.SELLER, UserRole.SUB_ADMIN, UserRole.ALL), adminApiLimiter, adminController.getAllPlatformData);

router.get("/get-platform-data-for-user",
  adminController.getPlatformDataForUser
);

router.patch("/update-user-role", auth(UserRole.ADMIN), adminApiLimiter, adminController.updateRole);

router.patch("/update-single-cateogory/:categoryId", auth(UserRole.ADMIN), adminApiLimiter, fileUploadLimiter, fileUploader.categoryImage,
  parseBodyData,
  adminController.updateSingleCategory
)

router.delete("/delete-single-category/:categoryId", auth(UserRole.ADMIN), adminApiLimiter, adminController.deleteSingleCategory)
export const adminRoute = router;
