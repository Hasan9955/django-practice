"use client";
import Image from "next/image";
import React, { useState } from "react";
import icon1 from "@/assets/icons/profile/Simplification.png";
import icon2 from "@/assets/icons/profile/Simplification (1).png";
import icon3 from "@/assets/icons/profile/Simplification (2).png";
import Orders from "./orders/Orders";
import ShippingBillingAddressForm from "./ShippingBillingAddressForm";
import AccountDetailsForm from "./AccountDetailsForm";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { useGetMyProductOrdersQuery } from "@/redux/features/product/productApi";
import { useGetMyProfileQuery } from "@/redux/features/auth/authApi";
import { Spin } from "antd";

const Welcome = () => {
  const [activeTab, setActiveTab] = useState<
    "Track-Order" | "Manage-Address" | "Account-Setting"
  >("Track-Order");
  const user = useAppSelector((state: RootState) => state.auth.user);
  const userId = user?.id || "";
  const { data: orderData, isLoading } = useGetMyProductOrdersQuery(userId);
  const { data: profileData, isLoading: isLoadingProfile } =
    useGetMyProfileQuery({});

  const userData = profileData?.result || {};
  const orders = orderData?.result?.data || [];

  const tabs = [
    {
      id: "Track-Order" as const,
      label: "Track Order",
      value: 20,
      icon: icon1,
    },
    {
      id: "Manage-Address" as const,
      label: "Manage Address",
      value: 20,
      icon: icon2,
    },
    {
      id: "Account-Setting" as const,
      label: "Account Setting",
      value: 20,
      icon: icon3,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Track-Order":
        return <Orders orders={orders} isLoading={isLoading} />;
      case "Manage-Address":
        return <ShippingBillingAddressForm />;
      case "Account-Setting":
        return <AccountDetailsForm />;
      default:
        return <Orders orders={orders} isLoading={isLoading} />;
    }
  };
  return (
    <div className="w-full">
      {/* Main Container */}
      <div className="px-1 sm:px-2 md:px-3 lg:px-4 xl:px-5 2xl:px-6 pt-4 sm:pt-5 md:pt-6 lg:pt-8 xl:pt-10 pb-6 sm:pb-8 md:pb-10 lg:pb-12 xl:pb-16 rounded-lg md:rounded-xl shadow-sm md:shadow-md bg-white border border-gray-200 rounded-lg md:rounded-xl">
        {/* Title */}
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-center text-[#1C1C1C] font-nun font-bold mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-tight">
          {`Welcome back, ${userData?.fullName || "User"}!`}
        </h2>

        {/* Stats - Responsive Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-5 mb-6 sm:mb-7 md:mb-8 lg:mb-10 pt-4 sm:pt-5 md:pt-6 lg:pt-8">
          {/* Orders Stat */}
          <div className="text-center px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 md:py-5 lg:py-6 border border-[#CECECE] rounded-lg md:rounded-xl bg-white hover:shadow-sm transition-shadow">
            <h6 className="font-nun font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-[#1C1C1C]">
              {isLoading ? <Spin /> : orders?.length}
              <span className="font-medium ml-2 text-sm sm:text-base md:text-lg lg:text-xl">
                Orders
              </span>
            </h6>
          </div>

          {/* Reward Points Stat */}
          <div className="text-center px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 md:py-5 lg:py-6 border border-[#CECECE] rounded-lg md:rounded-xl bg-white hover:shadow-sm transition-shadow">
            <h6 className="font-nun font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-[#1C1C1C]">
              {isLoadingProfile ? <Spin /> : userData?.rewardPoints}
              <span className="font-medium ml-2 text-sm sm:text-base md:text-lg lg:text-xl">
                Reward points
              </span>
            </h6>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-3 sm:py-4 md:py-5 lg:py-6 px-3 sm:px-4 md:px-5 lg:px-6
                  border rounded-lg md:rounded-xl 
                  flex items-center justify-center flex-col gap-2 sm:gap-3
                  w-full h-full
                  transition-all duration-200 ease-in-out cursor-pointer
                  ${
                    isActive
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md hover:shadow-lg"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                  }
                `}
              >
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={isActive ? 36 : 32}
                  height={isActive ? 36 : 32}
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 object-contain"
                />
                <p
                  className={`
                    font-nun font-semibold text-center
                    text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl
                    leading-tight
                    ${isActive ? "text-blue-700" : "text-gray-900"}
                  `}
                >
                  {tab.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6 sm:mt-7 md:mt-8 lg:mt-10">{renderTabContent()}</div>
    </div>
  );
};
export default Welcome;
