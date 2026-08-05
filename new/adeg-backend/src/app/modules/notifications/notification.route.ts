import { Router } from "express";
import auth from "../../middlewares/auth";
import { notificationController } from "./notification.controller";
import { notificationLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.get("/", auth(), notificationLimiter, notificationController.getNotificationsFrom);

export const notificationRoute = router;
