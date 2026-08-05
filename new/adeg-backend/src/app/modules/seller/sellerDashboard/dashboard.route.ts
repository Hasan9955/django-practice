import { Router } from "express";
import auth from "../../../middlewares/auth";
import { sellerDashboardController } from "./dashboard.controller";



const router = Router();


router.post("/create-shipping-options",
    auth(),
    sellerDashboardController.createShippingOptions
)


router.get("/get-shipping-options/:storeId", 
    sellerDashboardController.getShoppingOptionsByStoreId
)

router.get("/get-seller-dashboard-data",
    auth(),
    sellerDashboardController.getSellerDashboardData
)

router.get("/get-seller-sales-analytics",
    auth(),
    sellerDashboardController.getSellerSalesAnalytics
)

router.get("/get-seller-payment-data",
    auth(),
    sellerDashboardController.getSellerPaymentData
)

router.get("/get-seller-revenue-analytics",
    auth(),
    sellerDashboardController.getSellerRevenueAnalytics
)



export const sellerDashboardRoutes = router;