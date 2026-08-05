import express from "express";
import auth from "../../middlewares/auth";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { nicheHubControllers } from "./nicheHub.controller";
import { fileUploader } from "../../middlewares/fileUploder";
import { chatLimiter, fileUploadLimiter } from "../../middlewares/rateLimiter";

const router = express.Router();

router.post(
  "/create",
  auth(),
  chatLimiter,
  fileUploadLimiter,
  fileUploader.galleryImages,
  parseBodyData,
  nicheHubControllers.createNicheHubPost
);

router.get(
  "/get-all-niche-hub-posts",
  auth(),
  chatLimiter,
  nicheHubControllers.getAllNicheHubPosts
);

router.get(
  "/get-single-niche-hub-post/:id",
  auth(),
  chatLimiter,
  nicheHubControllers.getSingleNicheHubPost
);

router.delete(
  "/delete-niche-hub-post/:id",
  auth(),
  chatLimiter,
  nicheHubControllers.deleteNicheHubPost
);

router.put(
  "/update-niche-hub-post/:id",
  auth(),
  chatLimiter,
  fileUploadLimiter,
  fileUploader.galleryImages,
  parseBodyData,
  nicheHubControllers.updateNicheHubPost
);

router.post(
  "/vote-in-poll",
  auth(),
  chatLimiter,
  nicheHubControllers.voteInPoll
);

router.post(
  "/report-post",
  auth(),
  chatLimiter,
  nicheHubControllers.reportPost
);

router.delete(
  "/delete-niche-hub-post-by-admin/:id",
  auth(),
  chatLimiter,
  nicheHubControllers.deleteNicheHubPostByAdmin
);

router.post(
  "/block-user/:id",
  auth(),
  chatLimiter,
  nicheHubControllers.blockAUser
);

export const NicheHubRouters = router;
