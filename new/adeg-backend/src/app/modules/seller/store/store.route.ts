import express from "express";


import { fileUploader } from "../../../../helpers/fileUploader";

import { parseBodyData } from "../../../middlewares/parseBodyData";
import { storeController } from "./store.controller";
import { UserRole } from "@prisma/client";
import auth, { optionalAuth } from "../../../middlewares/auth";
import {
  adminApiLimiter,
  fileUploadLimiter,
  publicApiLimiter,
} from "../../../middlewares/rateLimiter";


const router = express.Router();

router.patch(
  "/update-store",
 auth(UserRole.SELLER, UserRole.ALL),
  adminApiLimiter,
  fileUploadLimiter,
   fileUploader.storeImages,
  parseBodyData,
  storeController.updateStore
);


router.get("/my-store", auth(UserRole.SELLER, UserRole.ALL), adminApiLimiter, storeController.getMystore);

router.get("/user-store/:storeId", optionalAuth(), publicApiLimiter, storeController.getUserStore);

router.get("/single-store/:slug", optionalAuth(), publicApiLimiter, storeController.getSingleStore);

router.get("/all-store", auth(UserRole.ADMIN), adminApiLimiter, storeController.getAllStore);

router.get("/all-store-for-user", publicApiLimiter, storeController.getAllStoreForUser);

router.post("/subscribe-store",
  auth(),
  adminApiLimiter,
  storeController.subscribeStore);

router.patch(
  "/update-store-status/:id",
  auth(UserRole.ADMIN),
  adminApiLimiter,
  storeController.updateStoreStatus
);


export const storeRoute = router;
