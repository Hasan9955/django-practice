"use client";

interface PromotionTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function PromotionTabs({
  activeTab,
  onTabChange,
}: PromotionTabsProps) {
  const tabs = [
    "Coupon Code",
    // "Time-Limited Discount",
    // "Flash Sale",
    // "Bulk Purchase Offer",
    // "Bundle Offers",
    // "New Launch Discount",
  ];

  return (
    <div
      style={{
        backgroundColor: "white",
        borderBottom: "1px solid #f0f0f0",
        padding: "12px 24px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        position: "sticky",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "32px",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              background: "none",
              border: "none",
              padding: "16px 0",
              fontSize: "14px",
              color: activeTab === tab ? "#1890ff" : "#595959",
              cursor: "pointer",
              borderBottom:
                activeTab === tab
                  ? "2px solid #1890ff"
                  : "2px solid transparent",
              whiteSpace: "nowrap",
              transition: "all 0.3s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
