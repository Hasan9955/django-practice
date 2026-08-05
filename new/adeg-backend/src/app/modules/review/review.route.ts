import { Router } from "express";
import { ReviewController } from "./review.controller";
import { fileUploader } from "../../middlewares/fileUploder";
import { parseBodyData } from "../../middlewares/parseBodyData";
import auth from "../../middlewares/auth";


const router = Router();


router.post("/create-review/:orderId", 
    auth(),
    fileUploader.reviewUpload,
    parseBodyData,
    ReviewController.addProductReview);

router.get("/get-product-reviews/:productId", ReviewController.getProductReviews);

router.get("/get-seller-reviews",
    auth(),
    ReviewController.getSellerReviews);

router.get("/get-user-reviews",
    auth(),
    ReviewController.getUserReviews);

router.delete("/delete-review/:reviewId",
    auth(),
    ReviewController.deleteReview
);


export const ReviewRouters = router;