"use client";
import { useState } from "react";
import Messenge from "./Message";
import Ticket from "./ticket/Ticket";
import RefundSystemPage from "./Refund";

const ContactSeller = () => {
  const [activeTab, setActiveTab] = useState<"Message" | "Ticket" | "Refund">(
    "Message"
  );
  const tabs = [
    {
      id: "Message" as const,
      label: "Message",
    },
    {
      id: "Ticket" as const,
      label: "Ticket",
    },
    {
      id: "Refund" as const,
      label: "Refund",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Message":
        return <Messenge />;
      case "Ticket":
        return <Ticket />;
      case "Refund":
        return <RefundSystemPage />;
      default:
        return <Ticket />;
    }
  };
  return (
    <div>
      <div>
        <h2 className="text-black font-nun text-[20px] font-semibold ">
          Contact Seller
        </h2>
        <div className="flex items-center justify-stretch gap-6 mt-6 mb-5 ">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`font-nun px-6 py-2.5 inline-block text-base font-medium text-gray-700 rounded-[12px] ${
                activeTab === tab.id
                  ? "bg-[#007BFF] text-white border border-[#E4E4E4] "
                  : "border border-[#E4E4E4] "
              } rounded-md`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="bg-[#D8D8D8] w-full h-[1px]" />
      </div>
      {renderTabContent()}
    </div>
  );
};

export default ContactSeller;
