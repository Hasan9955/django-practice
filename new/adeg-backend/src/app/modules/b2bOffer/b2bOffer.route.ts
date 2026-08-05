import express from "express";


import { b2bOfferControler } from "./b2bOffer.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/create-offer",
  auth(UserRole.SELLER, UserRole.ALL),

  b2bOfferControler.createB2bOffer
);

router.patch(
  "/update-offer-status",
  auth(),
  b2bOfferControler.updateB2BOffer
);

router.get("/get-my-b2b-orders",
  auth(),
  b2bOfferControler.getMyB2BOrders
);


export const b2bRoute = router;
