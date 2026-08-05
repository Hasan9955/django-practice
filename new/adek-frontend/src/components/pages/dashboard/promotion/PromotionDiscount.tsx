"use client";

import type React from "react";
import { useState } from "react";

import PromotionTabs from "./PromotionTabs";
import CouponSeller from "./CouponSeller";

const PromotionDiscount = () => {
  const [activeTab, setActiveTab] = useState("Coupon Code");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Promotion Tabs */}
      <PromotionTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === "Coupon Code" && (
        <div style={{ padding: "24px" }} className="bg-white">
          <CouponSeller />
        </div>
      )}
    </div>
  );
};

export default PromotionDiscount;
