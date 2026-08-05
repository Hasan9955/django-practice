import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { StripeServices } from './payment.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';




const createPayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const payload = req.body;
  const result = await StripeServices.createPayment(userId, payload);
;
  

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Authorized customer and payment request successfully",
    data: result,
  });
});



// Get all save cards for customer
const getCustomerSavedCards = catchAsync(
  async (req: Request, res: Response) => {
    const result = await StripeServices.getCustomerSavedCardsFromStripe(
      req?.params?.customerId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Retrieve customer cards successfully",
      data: result,
    });
  }
);

// Delete card from customer
const deleteCardFromCustomer = catchAsync(
  async (req: Request, res: Response) => {
    const result = await StripeServices.deleteCardFromCustomer(
      req.params?.paymentMethodId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Delete a card successfully",
      data: result,
    });
  }
);

// Refund payment to customer
const refundPaymentToCustomer = catchAsync(
  async (req: Request, res: Response) => {
    const result = await StripeServices.refundPaymentToCustomer(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Refund payment successfully",
      data: result,
    });
  }
);


const getMyTotalEarnings = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;

  const totalEarningsUSD = await StripeServices.getMyTotalEarnings(sellerId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Total earnings fetched successfully",
    data: totalEarningsUSD,
  });

});

const withdrawRequest = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.id;
  const payload = req.body;
  const result = await StripeServices.withdrawRequest(sellerId, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdraw request created successfully",
    data: result,
  });
});


const getAllWithdrawRequests = catchAsync(async (req: Request, res: Response) => {
  const options = req.query;
  const result = await StripeServices.getAllWithdrawRequests(req.user.id,options as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdraw requests fetched successfully",
    data: result,
  });
});


const updateRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await StripeServices.updateRequestStatus(id, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdraw request status updated successfully",
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const options = req.query;
  const result = await StripeServices.getMyOrders(userId, options as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My orders fetched successfully",
    data: result,
  });
});

const getMyStoreOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const options = req.query;
  const result = await StripeServices.getMyStoreOrders(userId, options as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My store orders fetched successfully",
    data: result,
  });
});

const getOrderDetails = catchAsync(async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  const result = await StripeServices.getOrderDetails(orderId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order details fetched successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const result = await StripeServices.updateOrderStatus(orderId, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});


export const PaymentController = {
  createPayment,
  getCustomerSavedCards,
  deleteCardFromCustomer,
  refundPaymentToCustomer,
  getMyTotalEarnings,
  withdrawRequest,
  getAllWithdrawRequests,
  updateRequestStatus,
  getMyOrders,
  getMyStoreOrders,
  getOrderDetails,
  updateOrderStatus,
};
