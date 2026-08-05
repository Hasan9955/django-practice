import { Router } from "express";
import auth from "../../middlewares/auth";
import { chatController } from "./chat.controller";
import { fileUploader } from "../../middlewares/fileUploder";
import { chatLimiter, fileUploadLimiter } from "../../middlewares/rateLimiter";


const router = Router();

router.get("/conversation-list", 
  auth(), 
  chatLimiter,
  chatController.getConversationList
);

router.post(
  "/chat-image-upload",
  auth(),
  chatLimiter,
  fileUploadLimiter,
  fileUploader.chatImage,
  chatController.chatImageUpload
);

router.patch(
  "/private-message-status/:conversationId",
  auth(),
  chatLimiter,
  chatController.markMessagesAsRead
);

router.get(
  "/get-single-message/:conversationId",
  auth(),
  chatLimiter,
  chatController.getSingleMessageList
);

export const chatRoute = router;
