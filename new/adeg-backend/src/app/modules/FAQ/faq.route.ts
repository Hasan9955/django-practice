import { Router } from "express";
import { faqController } from "./faq.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";



const router = Router();

router.get("/get-cms-content",  
    faqController.getCmsContent);

router.post("/upsert-faq-policy", 
    auth(UserRole.ADMIN || UserRole.SUB_ADMIN),
    faqController.createOrUpdatePrivacyFaqFooter);

router.delete("/delete-faq/:faqId", 
    auth(UserRole.ADMIN || UserRole.SUB_ADMIN),
    faqController.deleteFaq);


export const faqRoute = router;