import express from "express";
import auth from "../../middlewares/auth";
import { CommentControllers } from "./comment.controller";



const router = express.Router();

router.post("/create-comment", auth(),   CommentControllers.createComment );


router.get("/get-comments/:nicheHubId", auth(), CommentControllers.getAllCommentsByNicheHubId);

export const CommentRouters = router;
