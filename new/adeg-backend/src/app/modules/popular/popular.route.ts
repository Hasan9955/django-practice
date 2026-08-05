import { Router } from "express";
import { popularController } from "./popular.controller";
import { publicApiLimiter } from "../../middlewares/rateLimiter";



const router = Router();


router.get(
	"/most-popular-products",
	publicApiLimiter,
	popularController.getMostPopularProducts
)

router.get(
	"/most-popular-stores",
	publicApiLimiter,
	popularController.getMostPopularStore
)


export const popularRoutes = router;