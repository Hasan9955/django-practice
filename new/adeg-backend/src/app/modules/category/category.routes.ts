import express from "express";
import { CategoryControllers } from "./category.controller";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpers/fileUploader";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { publicApiLimiter } from "../../middlewares/rateLimiter";

const router = express.Router();

router.get("/", publicApiLimiter, CategoryControllers.getAllCategory);

router.get(
  "/single-category/:categoryId",
  auth(),
  publicApiLimiter,
  CategoryControllers.getSingleCategory
);

// router.put(
//   "/update-category/:categoryId",
//   fileUploader.uploadCategoryIcon,
//   parseBodyData,
//   auth(),
//   CategoryControllers.updateCategory
// );

// router.post(
//   "/delete-category/:categoryId",
//   auth(),
//   CategoryControllers.deleteSubCategory
// );

export const CategoryRoutes = router;
