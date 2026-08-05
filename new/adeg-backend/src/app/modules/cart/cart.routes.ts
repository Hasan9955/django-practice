import express from "express";
import { CartControllers } from "./cart.controller";
import auth from "../../middlewares/auth";
import { cartLimiter } from "../../middlewares/rateLimiter";
const router = express.Router();

router.post("/add-to-cart", auth(), cartLimiter, CartControllers.addToCart);

router.delete(
  "/remove-product-from-cart",
  auth(),
  cartLimiter,
  CartControllers.removeProductFromCart
);

router.delete(
  "/remove-selected-product",
  auth(),
  cartLimiter,
  CartControllers.removeSelectedProduct
);

router.delete(
  "/remove-all-product-from-cart",
  auth(),
  cartLimiter,
  CartControllers.removeAllProductFromCart
);

router.get("/my-cart", auth(), cartLimiter, CartControllers.getMyCartList);

export const CartRouters = router;
