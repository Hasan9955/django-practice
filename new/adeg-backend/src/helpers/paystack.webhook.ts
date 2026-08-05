import crypto from "crypto";
import sendResponse from "../shared/sendResponse";
import catchAsync from "../shared/catchAsync";
import prisma from "../shared/prisma";


const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY as string;

const handlePaystackWebHook = catchAsync(async (req: any, res: any) => {
  

  const signature = req.headers["x-paystack-signature"];

  // ❌ Missing signature
  if (!signature) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Missing Paystack signature header.",
      data: null,
    });
  }

  // 🔐 Verify signature
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(req.body)
    .digest("hex");

  if (hash !== signature) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Invalid Paystack signature.",
      data: null,
    });
  }

  // Convert raw buffer → JSON
  const event = JSON.parse(req.body.toString());

  console.log(event.event)

  // switch structure like Stripe
  switch (event.event) {
 
    // -----------------------------------------
    // ✅ Payment success
    // -----------------------------------------
    case "charge.success": {
      
     const data = event.data;
      const orderIdsArray = data.metadata.orderIds.split(",");

        await prisma.payment.update({
          where: {
            id: data.metadata.paymentId,
          },
          data: {
            status: "Paid",
          },
        });

        await prisma.order.updateMany({
          where: {
            id: {
              in: orderIdsArray,
            },
          },
          data: {
            isPaid: true,
          },
        });

      break;
    }

    // -----------------------------------------
    // ❌ Payment failed
    // -----------------------------------------
    case "charge.failed": {
      const data = event.data;

      

      break;
    }

    // -----------------------------------------
    // 🔁 Subscription created
    // -----------------------------------------
    case "subscription.create": {
      const data = event.data;

      // await PaymentService.handleSubscriptionCreated(data);
      break;
    }

    // -----------------------------------------
    // 🔁 Subscription renewed
    // -----------------------------------------
    case "invoice.payment_succeeded": {
      const data = event.data;
      const orderIdsArray = data.metadata.orderIds.split(",");

        await prisma.payment.update({
          where: {
            id: data.metadata.paymentId,
          },
          data: {
            status: "Paid",
          },
        });

        await prisma.order.updateMany({
          where: {
            id: {
              in: orderIdsArray,
            },
          },
          data: {
            isPaid: true,
          },
        });

      break;
    }

    // -----------------------------------------
    // ❌ Invoice / subscription payment failed
    // -----------------------------------------
    case "invoice.payment_failed": {
      // await PaymentService.failedCustomerPayment(event.data);
      break;
    }

    case "refund.processed": {
      const data = event.data;
    }

    // -----------------------------------------
    // 🟡 Other events
    // -----------------------------------------
    default:
      console.log(`⚠️ Unhandled Paystack event: ${event.event}`);
  }

  return res.status(200).send("Event received");
});

export default handlePaystackWebHook;
