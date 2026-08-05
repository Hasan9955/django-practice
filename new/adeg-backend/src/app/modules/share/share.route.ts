import { Router } from "express";
import auth from "../../middlewares/auth";
import { shareController } from "./share.controller";



const router = Router();


router.post("/create-share",
    auth(),
    shareController.createShare
);


router.get("/get-shares/:postId",
    shareController.getShares
)


export const ShareRouters = router;