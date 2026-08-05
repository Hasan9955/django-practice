import { notificationServices } from "../app/modules/notifications/notification.service";
import prisma from "../shared/prisma";
import sendEmail from "./sendMailBrevo";

// Helper to fetch platform logo once
export const getPlatformLogo = async (): Promise<string> => {
  const platformData = await prisma.platformMangement.findMany({});
  return (
    platformData[0]?.logo ||
    "https://adeg3.s3.eu-north-1.amazonaws.com/image/1771495384406-emp9e8gas2b.jpg"
  );
};

export const sendBuyerOrderEmail = async (
  orders: any[],
  buyerEmail: string,
) => {
  const totalAmount = orders.reduce((sum, o) => sum + o.price, 0);
  const subject = "Order Confirmation from Sellapy";
  const platformLogo = await getPlatformLogo();


  const itemsHtml = orders
    .map(
      (order) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px; font-size: 14px;">Order #${order.orderNumber}</td>
      <td style="padding: 10px; font-size: 14px; text-align: right;">${order.currency} ${order.price.toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <body style="font-family: sans-serif; background-color: #f6f9fc; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- ✅ Logo Header -->
        <div style="background: #ffffff; padding: 20px; text-align: center; border-bottom: 1px solid #eee;">
          <img src="${platformLogo}" alt="Platform Logo" style="max-height: 60px; max-width: 200px; object-fit: contain;" />
        </div>

        <div style="background: #007BFF; padding: 30px; text-align: center; color: white;">
          <h2 style="margin: 0 0 8px;">Order Confirmed!</h2>
          <p style="margin: 0;">Total Items: ${orders.length}</p>
        </div>

        <div style="padding: 20px;">
          <p>Hi ${orders[0].user.fullName},</p>
          <p>Your order has been placed successfully.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            ${itemsHtml}
            <tr>
              <td style="padding: 10px; font-weight: bold;">Total Paid</td>
              <td style="padding: 10px; font-weight: bold; text-align: right; color: #007BFF;">${orders[0].currency} ${totalAmount.toFixed(2)}</td>
            </tr>
          </table>
          <div style="text-align: center;">
            <a href="https://sellapy.com/account/my-orders" style="background: #007BFF; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 8px; display: inline-block;">Manage My Orders</a>
          </div>
        </div>

        <!-- ✅ Logo Footer -->
        <div style="background: #f6f9fc; padding: 16px; text-align: center; border-top: 1px solid #eee;">
          <img src="${platformLogo}" alt="Platform Logo" style="max-height: 40px; max-width: 140px; object-fit: contain; opacity: 0.7;" />
        </div>

      </div>
    </body>
  `;

  sendEmail(buyerEmail, subject, html);

  let buyerId = orders[0].userId as string;

  if (!buyerId) {
    const getBuyer = await prisma.user.findUnique({
      where: {
        email: buyerEmail,
      }
    });
    buyerId = getBuyer?.id as string;
  }

  try {
    await notificationServices.sendSingleNotification({
      id: buyerId,
      body: `Your order has been placed successfully.`,
      title: "Order Confirmation from Sellapy",
    })
  } catch (error) {
    console.log("Failed to send notification:", error);
  }
};

export const sendSellerOrderEmail = async (
  sellerOrders: any[],
  sellerEmail: string
) => {

  const storeName = sellerOrders[0].store?.shopName || "Your Store";
  const sellerSubtotal = sellerOrders.reduce((sum, o) => sum + o.price, 0);
  const subject = "New sale on Sellapy";
  const platformLogo = await getPlatformLogo(); // ✅ Now fetched here too

  const itemsHtml = sellerOrders
    .map(
      (order) => `
    <div style="padding: 10px; border: 1px solid #eee; margin-bottom: 5px; border-radius: 4px;">
      <strong>Order #${order.orderNumber}</strong> - ${order.currency} ${order.price.toFixed(2)}
    </div>
  `,
    )
    .join("");

  const html = `
    <body style="font-family: sans-serif; background-color: #f6f9fc; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

        <!-- ✅ Logo Header -->
        <div style="background: #ffffff; padding: 20px; text-align: center; border-bottom: 3px solid #007BFF;">
          <img src="${platformLogo}" alt="Platform Logo" style="max-height: 60px; max-width: 200px; object-fit: contain;" />
        </div>

        <div style="padding: 24px;">
          <h2 style="color: #007BFF; margin-top: 0;">New Sale for ${storeName}!</h2>
          <p>You have received <strong>${sellerOrders.length}</strong> new orders.</p>
          <div style="margin: 20px 0;">
            ${itemsHtml}
          </div>
          <p>Total Earnings: <strong>${sellerOrders[0].currency} ${sellerSubtotal.toFixed(2)}</strong></p>
          <a href="https://www.sellapy.com/dashboard/order-list" style="background: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Process Orders</a>
        </div>

        <!-- ✅ Logo Footer -->
        <div style="background: #f6f9fc; padding: 16px; text-align: center; border-top: 1px solid #eee;">
          <img src="${platformLogo}" alt="Platform Logo" style="max-height: 40px; max-width: 140px; object-fit: contain; opacity: 0.7;" />
        </div>

      </div>
    </body>
  `;

  sendEmail(sellerEmail, subject, html);

  let sellerId = sellerOrders[0].store?.ownerId;
  if (!sellerId) {
    const getSeller = await prisma.user.findUnique({
      where: {
        email: sellerEmail,
      }
    });
    sellerId = getSeller?.id;
  };

  try {
    await notificationServices.sendSingleNotification({
      id: sellerId,
      body: `You have received ${sellerOrders.length} new orders.`,
      title: "New sale on Sellapy",
    })
  } catch (error) {
    console.log("Failed to send notification:", error);
  }
};