import { Router } from "express";
import auth from "../../middlewares/auth";
import { subscriptionController } from "./subscription.controller";
import validateRequest from "../../middlewares/validateRequest";
import { subscriptionValidation } from "./subscription.validation";
import { UserRole } from "@prisma/client";


const router = Router();

router.post(
  "/create-subscription",
  validateRequest(subscriptionValidation.subscriptionSchema),
  auth(UserRole.ADMIN, UserRole.SUB_ADMIN),
  subscriptionController.createSubscriptionPlan
);

router.patch(
  "/update-subscription/:subscriptionId",
  auth(UserRole.ADMIN, UserRole.SUB_ADMIN),
  subscriptionController.updateSubscription
)
router.post(
  "/purchase-subscription",
  auth(),
  subscriptionController.purchaseSubscription
);

 
router.get(
  "/get-all-subscription",
  auth(UserRole.ADMIN, UserRole.SUB_ADMIN),
  subscriptionController.getAllSubscription
);
router.get(
  "/get-subscription",
  auth(),
  subscriptionController.getAllSubscriptionPlans
);
router.patch("/cancel-subscription/:subscriptionId",auth(),subscriptionController.cancelSubscription)

router.get(
  "/get-my-subscription",
  auth(),
  subscriptionController.getMySubscription
)



export const subscriptionRouter = router;
