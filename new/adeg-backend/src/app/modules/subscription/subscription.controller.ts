import { Request, Response } from "express";
import { subscriptionService } from "./subscription.service";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
const createSubscriptionPlan = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const subscriptionPlan = await subscriptionService.createSubscriptionIntoDb(
      payload
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Subscription plan created successfully",
      data: subscriptionPlan,
    });
  }
);

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const subscriptionPlan = await subscriptionService.updateSubscription(
    req.params.subscriptionId,
    payload
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription plan updated successfully",
    data: subscriptionPlan,
  });
})
const purchaseSubscription = catchAsync(async (req: Request, res: Response) => {
  const subscriptionPlan = await subscriptionService.purchaseSubscription(
   req.body.userId, req.body.subscriptionId
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Subscription plan purchase  successfully",
    data: subscriptionPlan,
  });
});

const getAllSubscription = catchAsync(async (req: Request, res: Response) => {
  const subscriptionPlan = await subscriptionService.getAllSubscription(
   req.query
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription plan get  successfully",
    data: subscriptionPlan,
  });
});
const getAllSubscriptionPlans = catchAsync(
  async (req: Request, res: Response) => {
    const subscriptionPlan =
      await subscriptionService.getAllSubscriptionPlans();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Subscription plan get  successfully",
      data: subscriptionPlan,
    });
  }
);

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
  const subscriptionPlan = await subscriptionService.cancelSubscription(
    req.params.subscriptionId,
    req.user.id
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription plan cancel  successfully",
    data: subscriptionPlan,
  });
});

const getMySubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.getMySubscription( 
    req.user.id
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My Subscription retrieved successfully",
    data: result || null,
  });
});


export const subscriptionController = {
  createSubscriptionPlan,
  purchaseSubscription,
  getAllSubscriptionPlans,
  cancelSubscription,
  updateSubscription,
  getAllSubscription,
  getMySubscription
};
