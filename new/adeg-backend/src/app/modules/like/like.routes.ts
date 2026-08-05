import express from "express";
import auth from "../../middlewares/auth";
import { LikeControllers } from "./like.controller";
import { wishlistLimiter } from "../../middlewares/rateLimiter";



const router = express.Router();

router.post("/toggle-like/:nicheHubId", auth(), wishlistLimiter, LikeControllers.toggleLike)

router.get("/get-like-user/:nicheHubId", auth(), wishlistLimiter, LikeControllers.seeAllLikeUser)



export const LikeRouters = router;
