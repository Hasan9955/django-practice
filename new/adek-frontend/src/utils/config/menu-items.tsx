import type { MenuItem } from "@/types/user";
import { SiPayloadcms, SiSubstack } from "react-icons/si";
import { LayoutDashboard } from "lucide-react";
import { BsBorderStyle, BsHeadsetVr } from "react-icons/bs";
import { VscFeedback } from "react-icons/vsc";
import { AiFillProduct } from "react-icons/ai";
import {
  FaClipboardList,
  FaFileInvoiceDollar,
  FaHubspot,
  FaPeopleCarry,
  FaStore,
  FaUserAstronaut,
} from "react-icons/fa";
import { GiHealthPotion, GiReturnArrow } from "react-icons/gi";
import {
  MdCampaign,
  MdOutlineAnalytics,
  MdOutlineBorderColor,
  MdOutlineBrandingWatermark,
  MdOutlineForwardToInbox,
  MdOutlineLocalShipping,
  MdOutlineMiscellaneousServices,
  MdOutlineMonetizationOn,
  MdOutlineMonitorHeart,
  MdOutlinePayments,
  MdOutlineSell,
  MdOutlineSettingsApplications,
  MdPlaylistAddCheckCircle,
} from "react-icons/md";
import { RiCoupon3Line, RiShoppingBag3Line } from "react-icons/ri";
import { SiHomeassistantcommunitystore } from "react-icons/si";
import {
  TbMessageCircleCog,
  TbSettingsCog,
  TbShoppingBagSearch,
} from "react-icons/tb";

import { TbTemplate } from "react-icons/tb";
import { HiMiniReceiptRefund } from "react-icons/hi2";
import { LuMessageSquareMore } from "react-icons/lu";

export const menuItems: MenuItem[] = [
  // Admin Only Sections
  {
    key: "platform-management",
    label: "Platform Management",
    icon: <TbTemplate className="h-5 w-5" />,
    href: "/dashboard/platform-management",
    roles: ["ADMIN"],
    children: [
      {
        key: "platform-settings",
        label: "Platform Settings",
        icon: <MdOutlineSettingsApplications className="h-5 w-5" />,
        href: "/dashboard/platform-management/platform-settings",
        roles: ["ADMIN"],
      },
      {
        key: "platform-sellers",
        label: "Theme & Branding Control",
        icon: <MdOutlineBrandingWatermark className="h-5 w-5" />,
        href: "/dashboard/platform-management/theme&branding-control",
        roles: ["ADMIN"],
      },
      {
        key: "platform-system",
        label: "CMS Pages",
        icon: <SiPayloadcms className="h-5 w-5" />,
        href: "/dashboard/platform-management/cms-pages",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    key: "Seller & Store Oversight",
    label: "Seller & Store Oversight",
    icon: <SiHomeassistantcommunitystore className="h-5 w-5" />,
    href: "/dashboard/seller&store-oversight/store-approvals",
    roles: ["ADMIN"],
    children: [
      {
        key: "store-approvals",
        label: "Store approvals",
        icon: <MdPlaylistAddCheckCircle className="h-5 w-5" />,
        href: "/dashboard/seller&store-oversight/store-approvals",
        roles: ["ADMIN"],
      },
      {
        key: "product-listings",
        label: "Product Listings",
        icon: <FaClipboardList className="h-5 w-5" />,
        href: "/dashboard/seller&store-oversight/product-listings",
        roles: ["ADMIN"],
      },
      {
        key: "seller-subscriptions",
        label: "Seller Subscriptions",
        icon: <SiSubstack className="h-5 w-5" />,
        href: "/dashboard/seller&store-oversight/seller-subscriptions",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    key: "orders&payments",
    label: "Orders & Payments",
    icon: <TbShoppingBagSearch className="h-5 w-5" />,
    href: "/dashboard/orders&payments/orderlogs",
    roles: ["ADMIN"],
    // badge: "12",
    children: [
      {
        key: "orders-all",
        label: "Order logs",
        icon: <BsBorderStyle className="h-5 w-5" />,
        href: "/dashboard/orders&payments/orderlogs",
        roles: ["ADMIN"],
      },
      {
        key: "invoice&billing",
        label: "Invoice & Billing",
        icon: <FaFileInvoiceDollar className="h-5 w-5" />,
        href: "/dashboard/orders&payments/invoice&billing",
        roles: ["ADMIN"],
        // badge: "5",
      },
      {
        key: "disputesrefunds",
        label: "Disputes/ Refunds",
        icon: <HiMiniReceiptRefund className="h-5 w-5" />,
        href: "/dashboard/orders&payments/disputesrefunds",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    key: "analytics&insights",
    label: "Analytics & Insights",
    icon: <MdOutlineAnalytics className="h-5 w-5" />,
    href: "/dashboard/analytics&insights/salesbyregion-category-celler",
    roles: ["ADMIN"],

    children: [
      {
        key: "salesbyregion-category-celler",
        label: "Sales by Region / Category / Seller",
        icon: <MdOutlineSell className="h-5 w-5" />,
        href: "/dashboard/analytics&insights/salesbyregion-category-celler",
        roles: ["ADMIN"],
      },
      {
        key: "seller-performance-monitor",
        label: "Seller Performance Monitor",
        icon: <MdOutlineMonitorHeart className="h-5 w-5" />,
        href: "/dashboard/analytics&insights/seller-performance-monitor",
        roles: ["ADMIN"],
        badge: "5",
      },
      {
        key: "marketplace-health",
        label: " Marketplace Health",
        icon: <GiHealthPotion className="h-5 w-5" />,
        href: "/dashboard/analytics&insights/marketplace-health",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    key: "user-support-control",
    label: "User support control",
    icon: <TbSettingsCog className="h-5 w-5" />,
    href: "/dashboard/user-support-control/admin-rules&permission",
    roles: ["ADMIN"],

    children: [
      {
        key: "admin-rules&permission",
        label: "All users & permissions",
        icon: <FaUserAstronaut className="h-5 w-5" />,
        href: "/dashboard/user-support-control/all-users&permissions",
        roles: ["ADMIN"],
      },
      {
        key: "support-inbox-ticket",
        label: "Support inbox ticket",
        icon: <MdOutlineForwardToInbox className="h-5 w-5" />,
        href: "/dashboard/user-support-control/support-inbox-ticket",
        roles: ["ADMIN"],
      },
      {
        key: "community-feedback",
        label: " Community feedback",
        icon: <VscFeedback className="h-5 w-5" />,
        href: "/dashboard/user-support-control/community-feedback",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    key: "monetization&promotions",
    label: "Monetization & Promotions",
    icon: <MdOutlineMonetizationOn className="h-5 w-5" />,
    href: "/dashboard/monetization&promotions/ads-promotions",
    roles: ["ADMIN"],

    children: [
      {
        key: "ads-promotions",
        label: "Ads & Promotions",
        icon: <BsHeadsetVr className="h-5 w-5" />,
        href: "/dashboard/monetization&promotions/ads-promotions",
        roles: ["ADMIN"],
      },
      {
        key: "coupon-management",
        label: "Coupon",
        icon: <RiCoupon3Line className="h-5 w-5" />,
        href: "/dashboard/monetization&promotions/coupon-management",
        roles: ["ADMIN"],
        // badge: "5",
      },
      {
        key: "b2b-service-portal",
        label: "B2B service portal",
        icon: <MdOutlineMiscellaneousServices className="h-5 w-5" />,
        href: "/dashboard/monetization&promotions/b2b-service-portal",
        roles: ["ADMIN"],
      },
    ],
  },

  // Seller Sections
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/dashboard",
    roles: ["SELLER", "ALL"],
  },
  {
    key: "payment",
    icon: <MdOutlinePayments size={25} />,
    label: "Payment",
    href: "/dashboard/payment",
    roles: ["SELLER", "ALL"],
  },
  {
    key: "order-list",
    icon: <MdOutlineBorderColor size={25} />,
    label: "Order list",
    href: "/dashboard/order-list",
    roles: ["SELLER", "ALL"],
  },
  {
    key: "all-product",
    icon: <AiFillProduct />,
    label: "All product",
    href: "/dashboard/all-product",
    roles: ["SELLER", "ALL"],
  },
  {
    key: "profile",
    icon: <FaStore size={25} />,
    label: "Store Profile",
    href: "/dashboard/profile",
    roles: ["SELLER", "ALL"],
  },
  {
    key: "messages",
    icon: <LuMessageSquareMore size={25} />,
    label: "Messages",
    href: "/dashboard/messages",
    roles: ["SELLER", "ALL"],
  },
  {
    key: "reviews",
    icon: <TbMessageCircleCog size={25} />,
    label: "My Reviews",
    href: "/dashboard/reviews",
    roles: ["SELLER", "ALL"],
  },
  {
    key: "shipping-setting",
    icon: <MdOutlineLocalShipping />,
    label: "Shipping setting",
    href: "/dashboard/shipping-setting",
    roles: ["SELLER", "ALL"],
  },
  {
    key: "returns-disput",
    icon: <GiReturnArrow />,
    label: "Returns & Disputes",
    href: "/dashboard/returns-disput",
    roles: ["SELLER", "ALL"],
  },
  {
    key: "b2bportal",
    icon: <FaPeopleCarry />,
    label: "B2B portal",
    href: "/dashboard/b2bportal",
    roles: ["SELLER", "ALL"],
  },
  {
    key: "promotion-discount",
    icon: <MdCampaign size={25} />,
    label: "Promotion & discount",
    href: "/dashboard/promotion-discount",
    roles: ["SELLER", "ALL"],
  },
  {
    key: "nichehub",
    icon: <FaHubspot size={25} />,
    label: "Niche Hub",
    href: "/dashboard/nichehub",
    roles: ["SELLER", "ALL"],
  },
  {
    key: "sellapypro",
    icon: <RiShoppingBag3Line size={25} />,
    label: "Sellapy pro",
    href: "/dashboard/sellapypro",
    roles: ["SELLER", "ALL"],
  },
];
