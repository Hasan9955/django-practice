import express from "express";
import { authController } from "./auth.controller";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";

import verifyOtpToken from "../../middlewares/verifyOtpToken";
import auth from "../../middlewares/auth";
import { authLimiter, otpLimiter } from "../../middlewares/rateLimiter";

const router = express.Router();

router.post(
  "/login",
  authLimiter,
  validateRequest(authValidation.authLoginSchema),
  authController.loginUser
);

router.post(
  "/forgetpassword-otp-to-gmail",
  otpLimiter,
  authController.forgetPasswordToGmail
);

router.post(
  "/verfiy-otp",
  otpLimiter,
  validateRequest(authValidation.verifyOtpSchema),
  verifyOtpToken(),
  authController.verifyOtp
);
router.patch(
  "/reset-password",
  otpLimiter,
  verifyOtpToken(),
  authController.resetPassword
);

router.post(
  "/resend-otp",
  otpLimiter,
  validateRequest(authValidation.resendOtpSchema),
  authController.resendOtp
);
router.post("/change-password", auth(), authLimiter, authController.changePassword);
router.post(
  "/social-login",
  authLimiter,
  authController.socialLoginIntoDb
);
export const authRoute = router;
