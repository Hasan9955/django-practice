import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import cors from "cors";
import router from "./app/routes";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import { PrismaClient } from "@prisma/client";
import path from "path";
import handleWebHook from "./helpers/stripe.webhook";

import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import {
  bullNotificationQueue,
  communityPostFileQueue,
  conversationListQueue,
  messagePersistenceQueue,
  otpQueueEmail,
  refundMessagePersistenceQueue,
  ticketMessagePersistenceQueue,
} from "./helpers/redis";
import { cancelTemplate } from "./app/lib/cancelTemplete";
import paymentSuccessTemplate from "./app/lib/successTemplete";
import handlePaystackWebHook from "./helpers/paystack.webhook";
import morgan from "morgan";





const app: Application = express();
const prisma = new PrismaClient();
app.set("trust proxy", 1);

const corsOptions = {
  origin: [
    "http://localhost:3050",
    "https://localhost:3031",
    "https://kamodoc-frontend.vercel.app",
    "http://145.223.120.135:3050",
    "http://10.0.20.48:3050",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://51.20.73.224:3050",
    "http://51.20.73.224:3050",
    "http://51.20.73.224",
    "http://13.48.57.189",
    "http://13.48.57.189:3050",
    "http://13.48.57.189:80",
    "http://13.48.57.189/",
    "https://sellapy.com",
    "https://www.sellapy.com",
    "http://sellapy.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(
  "/api/v1/stripe/payment-webhook",
  express.raw({ type: "application/json" }),
  handleWebHook,
);

app.use(
  "/api/v1/paystack/payment-webhook",
  express.raw({ type: "application/json" }),
  handlePaystackWebHook,
);

// Middleware setup

app.use("/payment-success", async (req: Request, res: Response) => {
  const { paymentId } = req.query;

  const htmlTemplate = await paymentSuccessTemplate();
  res.send(htmlTemplate);
});

app.use("/payment-cancel", (req: Request, res: Response) => {
  res.send(cancelTemplate());
});
prisma
  .$connect()
  .then(() => {
    console.log("✅ Database connected successfully!");
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
app.use(
  "/api/v1/stripe/payment-webhook",
  express.raw({ type: "application/json" }),
  handleWebHook,
);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const uploadDir = path.join(process.cwd(), "uploads");

// Route handler for root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "Welcome to api main route",
  });
});

app.get("/payment", (req: Request, res: Response) => {
  res.render("stripe");
});

app.use(morgan('dev'));
// Router setup
app.use("/api/v1", router);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");
createBullBoard({
  queues: [
    new BullMQAdapter(otpQueueEmail),
    new BullMQAdapter(communityPostFileQueue),
    new BullMQAdapter(bullNotificationQueue),
    new BullMQAdapter(conversationListQueue),
    new BullMQAdapter(messagePersistenceQueue),
    new BullMQAdapter(ticketMessagePersistenceQueue),
    new BullMQAdapter(refundMessagePersistenceQueue),
  ],
  serverAdapter,
});

// Mount the dashboard
app.use("/admin/queues", serverAdapter.getRouter());

// Global Error Handler
app.use(GlobalErrorHandler);

// API Not found handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
