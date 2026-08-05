import express from "express";
import { authRoute } from "../modules/auth/auth.routes";
import { chatRoute } from "../modules/chat/chat.routes";
import { userRoute } from "../modules/user/user.routes";
import { adminRoute } from "../modules/admin/admin.route";
import { groupRoute } from "../modules/group/group.route";
import { notificationRoute } from "../modules/notifications/notification.route";
import { productRoute } from "../modules/seller/product/product.route";
import { storeRoute } from "../modules/seller/store/store.route";
import { CategoryRoutes } from "../modules/category/category.routes";
import { CartRouters } from "../modules/cart/cart.routes";
import { couponRoute } from "../modules/seller/coupon/coupon.route";
import { PaymentRouters } from "../modules/payment/payment.routes";
import { bannerRoute } from "../modules/banner/banner.routes";
import { NicheHubRouters } from "../modules/nicheHub/nicheHub.routes";
import { LikeRouters } from "../modules/like/like.routes";
import { CommentRouters } from "../modules/comment/comment.routes";
import { FollowRouters } from "../modules/follow/follow.route";
import { ShareRouters } from "../modules/share/share.route";
import { ReviewRouters } from "../modules/review/review.route";
import { sellerDashboardRoutes } from "../modules/seller/sellerDashboard/dashboard.route";
import { adminDashboardRoutes } from "../modules/admin/adminDashboard/adminDashboard.route";
import { ticketRoutes } from "../modules/ticket/ticket.route";
import { b2bRoute } from "../modules/b2bOffer/b2bOffer.route"; 
import { refundRoutes } from "../modules/refund/refund.route";
import { faqRoute } from "../modules/FAQ/faq.route";
import { subscriptionRouter } from "../modules/subscription/subscription.route";
import { promotionRoutes } from "../modules/promotion/promotion.route";
import { b2bPortalRoutes } from "../modules/b2bPortal/b2bPortal.route";
import { popularRoutes } from "../modules/popular/popular.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/chat",
    route: chatRoute,
  },
  {
    path: "/admin",
    route: adminRoute,
  },

  {
    path: "/group",
    route: groupRoute,
  },

  {
    path: "/notification",
    route: notificationRoute,
  },
  {
    path: "/coupon",
    route: couponRoute,
  },
  {
    path: "/banner",
    route: bannerRoute,
  },
  {
    path: "/category",
    route: CategoryRoutes,
  },
  {
    path: "/product",
    route: productRoute,
  },
  {
    path: "/store",
    route: storeRoute,
  },
  {
    path: "/carts",
    route: CartRouters,
  },
  {
    path: "/payment",
    route: PaymentRouters,
  },
  {
    path: "/niche-hub",
    route: NicheHubRouters,
  },
  {
    path: "/likes",
    route: LikeRouters,
  },
  {
    path: "/comments",
    route: CommentRouters,
  },
  {
    path: "/follow",
    route: FollowRouters,
  },
  {
    path: "/share",
    route: ShareRouters,
  },
  {
    path: "/reviews",
    route: ReviewRouters,
  },
  {
    path: "/seller-dashboard",
    route: sellerDashboardRoutes,
  },
  {
    path: "/admin-dashboard",
    route: adminDashboardRoutes,
  },
  {
    path: "/ticket",
    route: ticketRoutes,
  },
  {
    path: "/refund",
    route: refundRoutes,
  },
  {
    path: "/promotion",
    route: promotionRoutes,
  },
  {
    path: "/faq-policy",
    route: faqRoute,
  },
  {
    path:"/b2b-offer",
    route:b2bRoute
  },
  {
    path:"/popular",
    route: popularRoutes
  },
  {
    path:"/b2b-portal",
    route:b2bPortalRoutes
  },
  {
    path:"/subscriptions",
    route:subscriptionRouter
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
