import { Router } from "express";
import auth from "../../../middlewares/auth";
import { adminDashboardController } from "./adminDashboard.controller";
import { UserRole } from "@prisma/client";
import { adminApiLimiter } from "../../../middlewares/rateLimiter";



const router = Router();


router.get("/get-all-seller-list",
    auth(),
    adminApiLimiter,
    adminDashboardController.getAllSellerList
)

router.get("/get-all-subscribedsellers",
    auth(),
    adminApiLimiter,
    adminDashboardController.getAllSubscribedSellers
)

router.get("/get-all-order-list",
    auth(UserRole.ADMIN, UserRole.SUB_ADMIN),
    adminApiLimiter,
    adminDashboardController.getAllOrderList
)

router.get("/get-seller-products/:sellerId",
    auth(),
    adminApiLimiter,
    adminDashboardController.getAllProducts
)

router.get("/seller-performance/:sellerId",
    auth(),
    adminApiLimiter,
    adminDashboardController.sellerPerformanceData
)

router.get("/get-order-table/:sellerId",
    auth(),
    adminApiLimiter,
    adminDashboardController.getOrderTableData
)

router.get("/seller-insight-chart/:sellerId",
    auth(),
    adminApiLimiter,
    adminDashboardController.sellInsightChartData
)

router.get("/seals-insight-by-region",
    auth(),
    adminApiLimiter,
    adminDashboardController.getSalesInsightsByRegion
)

router.get("/get-market-place-health-data",
    auth(),
    adminApiLimiter,
    adminDashboardController.getMarketPlaceHealthData
)

router.get("/market-place-revenue-chart",
    auth(),
    adminApiLimiter,
    adminDashboardController.getMarketPlaceRevenueChartData
)

router.get("/market-place-sales-chart",
    auth(),
    adminApiLimiter,
    adminDashboardController.marketPlaceHealthSalesChartData
)

router.get("/new-listed-products",
    auth(),
    adminApiLimiter,
    adminDashboardController.getNewlyListedProducts
)

export const adminDashboardRoutes = router;