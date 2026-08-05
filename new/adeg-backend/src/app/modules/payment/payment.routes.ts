import express from 'express';
import auth from '../../middlewares/auth';
import { PaymentController } from './payment.controller';
import { orderLimiter } from '../../middlewares/rateLimiter';

const router = express.Router();


router.get(
  "/my-total-earnings",
  auth(),
  PaymentController.getMyTotalEarnings
);

router.get(
  "/my-orders/:userId",
  auth(),
  PaymentController.getMyOrders
);

router.get(
  "/my-store-orders/:userId",
  auth(),
  PaymentController.getMyStoreOrders
);

router.get(
  "/order-details/:orderId",
  auth(),
  PaymentController.getOrderDetails
);

router.get("/get-all-withdraw-requests", auth(), PaymentController.getAllWithdrawRequests);


router.get("/:customerId", PaymentController.getCustomerSavedCards);



router.post(
  "/create",
  auth(),
  orderLimiter,
  PaymentController.createPayment
);


router.delete(
  "/delete-card/:paymentMethodId",
  PaymentController.deleteCardFromCustomer
);


router.post(
  "/refund-payment",
  auth(),
  orderLimiter,
  PaymentController.refundPaymentToCustomer
);



router.post("/withdraw-request", auth(), orderLimiter, PaymentController.withdrawRequest);

router.patch("/update-request-status/:id", auth(), orderLimiter, PaymentController.updateRequestStatus);

router.patch("/update-order-status/:orderId", auth(), orderLimiter, PaymentController.updateOrderStatus);




export const PaymentRouters = router;
