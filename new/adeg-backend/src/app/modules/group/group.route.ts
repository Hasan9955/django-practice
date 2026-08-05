import { Router } from "express";
import { groupController } from "./group.controller";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpers/fileUploader";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { chatLimiter, fileUploadLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.post(
  "/create",
  auth(),
  chatLimiter,
  fileUploadLimiter,
  // groupCreateAccess,
  fileUploader.groupImage,
  parseBodyData,
  groupController.createGroup
);

router.patch(
  "/update/:groupId",
  auth(),
  chatLimiter,
  fileUploadLimiter,
  fileUploader.groupImage,
  parseBodyData,
  groupController.updateGroup
);
router.delete("/delete/:groupId", auth(), chatLimiter, groupController.deleteGroup);
router.patch("/join-group/:groupId", auth(), chatLimiter, groupController.joinGroup);
router.get("/get-user-group",auth(),chatLimiter,groupController.getUserGroup)

export const groupRoute = router;
