import express from "express";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpers/fileUploader";
import { bannerController } from "./banner.controller";
import { parseBodyData } from "../../middlewares/parseBodyData";
import {
  adminApiLimiter,
  fileUploadLimiter,
  publicApiLimiter,
} from "../../middlewares/rateLimiter";

const router = express.Router();

// router.post(
//   "/create-banner",
//   auth(),
//   fileUploader.bannerImage,
//   parseBodyData,
//   bannerController.createBanner
// );

router.get("/get-all-banners", publicApiLimiter, bannerController.getAllBanner);

router.patch(
  "/update-banner/:id",
  auth(),
  adminApiLimiter,
  fileUploadLimiter,
  fileUploader.bannerImage,
  parseBodyData,
  bannerController.updateBanner
);

router.delete("/delete-banner/:id", auth(), adminApiLimiter, bannerController.delteBanner);

export const bannerRoute = router;
