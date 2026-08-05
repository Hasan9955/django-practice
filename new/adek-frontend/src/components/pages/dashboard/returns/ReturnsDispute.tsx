
// src/components/ReturnsDispute.tsx
"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Select } from "antd";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";
import ReturnsDisputeTable from "./ReturnsDisputeTable";
import { Defended } from "./Defended";

const { Option } = Select;

type TabId = "new-request" | "defended" | "accepted";

interface Tab {
  id: TabId;
  label: string;
  status: "PENDING" | "APPROVED" | "COMPLETED";
}

const tabs: Tab[] = [
  { id: "new-request", label: "New request", status: "PENDING" },
  { id: "defended", label: "Defended", status: "APPROVED" },
  { id: "accepted", label: "Accepted", status: "COMPLETED" },
];

const ReturnsDispute = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("new-request");

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  console.log(currentTab);

  return (
    <div className="flex flex-col items-center gap-14 self-stretch">
      <div className="w-full border border-[#D8D8D8] rounded-2xl bg-white p-7 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-[#1C1C1C] text-3xl font-medium font-inter">
            Returns and Disputes
          </h4>

          <div className="hidden items-center gap-3">
            <span className="text-sm text-gray-600">Sort by</span>
            <Select defaultValue="jul-2024" style={{ width: 120 }}>
              <Option value="jul-2024">Jul 2024</Option>
              <Option value="jun-2024">Jun 2024</Option>
              <Option value="may-2024">May 2024</Option>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 text-base font-medium rounded-full transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#007BFF] text-white"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or order"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-72"
              />
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full">
        {activeTab === "new-request" && (
          <ReturnsDisputeTable searchQuery="PENDING" />
        )}
        {activeTab === "defended" && <Defended />}
        {activeTab === "accepted" && (
          <ReturnsDisputeTable searchQuery="APPROVED" />
        )}
      </div>
    </div>
  );
};

export default ReturnsDispute;
