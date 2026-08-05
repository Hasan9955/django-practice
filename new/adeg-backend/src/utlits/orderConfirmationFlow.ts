import { sendBuyerOrderEmail, sendSellerOrderEmail } from "../helpers/sendMailOfOrderConfirmation";

export const sendOrderConfirmationFlow = async (orders: any[]) => {
  const buyer = orders[0].user;
  if (!buyer) return;

  // --- 1. SEND TO BUYER (All items) ---
  await sendBuyerOrderEmail(orders, buyer.email);

  // --- 2. SEND TO SELLERS (Grouped by Store) ---
  const storeGroups: Record<string, any[]> = {};

  orders.forEach((order) => {
    if (order.storeId) {
      if (!storeGroups[order.storeId]) {
        storeGroups[order.storeId] = [];
      }
      storeGroups[order.storeId].push(order);
    }
  });

  // Loop through each store and send them their specific orders
  for (const storeId in storeGroups) {
    const sellerOrders = storeGroups[storeId];
    const sellerEmail = sellerOrders[0].store?.email;
    if (sellerEmail) {
      await sendSellerOrderEmail(sellerOrders, sellerEmail);
    }
  }
};