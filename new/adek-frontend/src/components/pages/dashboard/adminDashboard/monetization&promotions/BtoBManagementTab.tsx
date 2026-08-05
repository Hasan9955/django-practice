"use client";
import { useState } from "react";
import B2BInsights from "./B2BInsights";
// import B2BLead from "./B2BLead";
// import SellerVerification from "./SellerVerification";
// import DeactivateExporter from "./DeactivateExporter";

const BtoBManagementTab = () => {
  const [activeTab, setActiveTab] = useState<
    "B2Binsights" | "B2Blead" | "Sellerverification" | "Deactivateexporter"
  >("B2Blead");

  const tabs = [
    { id: "B2Binsights" as const, label: "B2B insights" },
    // {
    //   id: "B2Blead" as const,
    //   label: "B2B lead",
    // },
    // {
    //   id: "Sellerverification" as const,
    //   label: "Seller verification",
    // },
    // {
    //   id: "Deactivateexporter" as const,
    //   label: "Deactivate exporter",
    // },
  ];
  const renderTabContent = () => {
    switch (activeTab) {
      case "B2Binsights":
        return <B2BInsights />;
      // case "B2Blead":
      // 	return <B2BLead />;
      // case "Sellerverification":
      // 	return <SellerVerification />;
      // case "Deactivateexporter":
      // 	return <DeactivateExporter />;
      default:
      	return <B2BInsights />;
    }
  };
  return (
    <div>
      <div className="rounded-[16px] bg-[#FFF] flex flex-col p-[20px_24px] justify-between items-start gap-[20px]">
        <h4 className="text-black font-nun text-[32px] font-bold">
          B2B management
        </h4>
        <div className="flex w-full items-start justify-stretch gap-4">
          {tabs.map((tab) => {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-[12px] border transition-all ${
                  activeTab === tab.id
                    ? "bg-[#007BFF] "
                    : "border-[#E4E4E4] bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="text-center">
                  <div
                    className={`text-base font-nun font-normal ${
                      activeTab === tab.id ? "text-white" : "text-[#322F35]"
                    }`}
                  >
                    {tab.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="bg-[#D8D8D8] w-full h-[1px] "></div>
      </div>
      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default BtoBManagementTab;
