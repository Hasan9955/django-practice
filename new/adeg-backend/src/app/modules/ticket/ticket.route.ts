import { Router } from "express";
import { TicketController } from "./ticket.controller";
import auth from "../../middlewares/auth";
import { chatLimiter, orderLimiter } from "../../middlewares/rateLimiter";



const router = Router();

router.post("/create-ticket",
    auth(),
    chatLimiter,
    TicketController.createTicketIntoDB);

router.get("/get-all-ticket-conversation",
    auth(),
    chatLimiter,
    TicketController.getAllTicketConversation);

router.get("/get-my-ticket-conversation",
    auth(),
    chatLimiter,
    TicketController.getMyTicketConversation);


router.patch(
    "/message-status/:ticketId",
    auth(),
    chatLimiter,
      TicketController.markMessagesAsRead
);

router.get(
    "/get-single-ticket-message/:ticketId",
    auth(),
    chatLimiter,
      TicketController.getSingleMessageList
);

router.patch(
    "/update-ticket-status",
    auth(),
    orderLimiter,
    TicketController.updateTicketStatus
);

export const ticketRoutes = router;