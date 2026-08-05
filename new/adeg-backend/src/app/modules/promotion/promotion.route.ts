import { Router } from "express";
import auth from "../../middlewares/auth";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { fileUploader } from "../../middlewares/fileUploder";
import { promotionController } from "./promotion.controller";
import {
	adminApiLimiter,
	fileUploadLimiter,
	publicApiLimiter,
} from "../../middlewares/rateLimiter";


const router = Router();


router.get("/get-all-promotions", publicApiLimiter, promotionController.getAllPromotion);

router.get("/get-single-promotion/:promotionId", publicApiLimiter, promotionController.getSinglePromotion);

router.post("/create-promotion", 
auth(),
adminApiLimiter,
fileUploadLimiter,
fileUploader.promotionImage,
parseBodyData,
promotionController.createPromotion
);

router.patch("/update-promotion/:promotionId", 
auth(),
adminApiLimiter,
fileUploadLimiter,
fileUploader.promotionImage,
parseBodyData,
promotionController.updatePromotion
);

router.delete("/delete-promotion/:promotionId", auth(), adminApiLimiter, promotionController.deletePromotion);




export const promotionRoutes = router;