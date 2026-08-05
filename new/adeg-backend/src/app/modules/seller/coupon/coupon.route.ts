import express from "express";
import { parseBodyData } from "../../../middlewares/parseBodyData";
import { couponController } from "./coupon.controller";
import { UserRole } from "@prisma/client";
import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";
import { couponValidation } from "./coupon.validation";


const router = express.Router();

router.post(
  "/create-coupon",
  auth(UserRole.SELLER, UserRole.ALL),
  validateRequest(couponValidation.couponSchema),
  couponController.createCoupon
);

router.get(
  "/all-coupons",
  auth(),
  couponController.getAllCouponAsAdmin
);

router.get(
  "/my-coupons/:storeId",
  auth(),
  couponController.getAllCoupon
);

router.patch(
  "/update-coupon/:id",
  auth(UserRole.SELLER, UserRole.ALL),
  validateRequest(couponValidation.couponSchema),
  parseBodyData,
  couponController.updateCoupon
);

router.delete(
  "/delete-coupon/:id",
  auth(UserRole.SELLER, UserRole.ALL),
  couponController.deleteCoupon
);

router.post(
  "/apply-coupon",
  auth(),
  couponController.applyCoupon
);





export const couponRoute = router;
