import { Router } from "express";
import { B2BPortalController } from "./b2bPortal.controller";
import auth from "../../middlewares/auth";



const router = Router();


router.get("/get-all-b2b-packages", B2BPortalController.getAllB2BPackages)

router.get("/get-b2b-dashboard-static", B2BPortalController.getB2BDashboardStatics)

router.get("/get-b2b-dashboard-chart", B2BPortalController.getB2bDashboardChartData)

router.get("/get-b2b-dashboard-listing", B2BPortalController.getB2BDashboardListing)


router.get("/get-seller-b2b-packages",
    auth(),
    B2BPortalController.getB2BPackagesBySellerId)

router.get("/get-b2b-conversation",
    auth(),
    B2BPortalController.getB2BConversationList)



export const b2bPortalRoutes = router;