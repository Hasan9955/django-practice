import express from "express";

import { userController } from "./user.controller";
import { userValidation } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";

import { parseBodyData } from "../../middlewares/parseBodyData";

import auth from "../../middlewares/auth";


import { fileUploader } from "../../../helpers/fileUploader";
import { UserRole } from "@prisma/client";
import { authLimiter, fileUploadLimiter } from "../../middlewares/rateLimiter";



const router = express.Router();

router.post(
  "/create",
  authLimiter,
  validateRequest(userValidation.userRegisterValidationSchema),
  userController.createUser
);
router.patch(
  "/update-profile",
  auth(),
  fileUploadLimiter,
  fileUploader.userImage,
  parseBodyData,
  userController.updateProfile
);

router.get("/get-profile", auth(), userController.getUserProfile);

router.get("/get-all-users", 
  auth(UserRole.ADMIN, UserRole.SUB_ADMIN), 
  userController.getAllUsers
);

router.get(
  "/get-other-user-profile/:id",
  auth(),
  userController.getOtherUserProfile
);

router.delete("/delete-account", auth(), userController.deleteAccount);

router.delete(
  "/delete-user/:userId",
  auth(UserRole.ADMIN, UserRole.SUB_ADMIN),
  userController.deleteUser
);

router.patch(
  "/update-user-status/:userId",
  auth(UserRole.ADMIN, UserRole.SUB_ADMIN),
  userController.updateUserStatus
);


export const userRoute = router;
