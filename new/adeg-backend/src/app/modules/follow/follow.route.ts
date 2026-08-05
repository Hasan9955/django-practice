import { Router } from "express";
import { followController } from "./follow.controller";
import auth from "../../middlewares/auth";



const router = Router();


router.post("/create-follow",
    auth(),
    followController.createFollow);

router.get("/get-my-followings", 
    auth(),
    followController.getMyFollowings);

router.get("/get-store-followers/:storeId",
    auth(),
    followController.getStoreFollower);

export const FollowRouters = router;


