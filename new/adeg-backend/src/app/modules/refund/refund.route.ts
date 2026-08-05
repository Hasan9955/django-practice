import { Router } from "express";
import auth from "../../middlewares/auth"; 
import { fileUploader } from "../../../helpers/fileUploader";
import { RefundController } from "./refund.controller";
import { UserRole } from "@prisma/client";
import { chatLimiter, orderLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.post("/create-refund-conversation", 
  auth(), 
  chatLimiter,
  RefundController.createRefundConversation
);

router.get("/refund-conversation-list", 
  auth(), 
  chatLimiter,
  RefundController.getRefundConversationListIntoDB
);

router.get("/refund-conversation-list-for-admin", 
  auth(UserRole.ADMIN, UserRole.SUB_ADMIN), 
  chatLimiter,
  RefundController.getRefundConversationListForAdmin
);

router.patch(
  "/message-status/:refundConversationId",
  auth(),
  chatLimiter,
  RefundController.markMessagesAsRead
);

router.get(
  "/get-single-refund-message/:refundId",
  auth(),
  chatLimiter,
  RefundController.getSingleMessageList
);

router.patch(
  "/update-refund-status",
  auth(),
  orderLimiter,
  RefundController.updateRefundStatus
);

export const refundRoutes = router;
