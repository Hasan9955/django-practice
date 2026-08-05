/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface Props {
  data?: any;
  isLoading: boolean;
}

const SubscriptionRowCard: React.FC<Props> = ({ data, isLoading }) => {
  // Loading State
  if (isLoading) {
    return (
      <div className="w-full h-30 bg-gray-200 animate-pulse rounded-xl border border-gray-100" />
    );
  }

  const sub = data?.result?.UserSubscription;

  // No Data State
  if (!sub) {
    return (
      <div className="w-full h-30 flex items-center justify-center border-2 border-dashed rounded-xl border-gray-200 text-gray-400">
        No Active Subscription
      </div>
    );
  }

  const expiryDate = new Date(sub.endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="group relative w-full md:w-[600px] h-30 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600" />

      <div className="flex items-center h-full px-6 py-4 justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-800 tracking-tight">
              {sub.subscription.type.replace("PRO", " Pro")}
            </h3>
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              {sub.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Billed {sub.subscription.interval}ly
          </p>
        </div>

        {/* Middle Section: Cost */}
        <div className="hidden md:flex flex-col items-center">
          <span className="text-2xl font-black text-gray-900">
            ${sub.subscription.price}
          </span>
          <span className="text-[10px] text-gray-400 uppercase font-semibold">
            Current Rate
          </span>
        </div>

        {/* Right Section: Expiry & Action */}
        <div className="flex items-center gap-8">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">
              Renews On
            </p>
            <p className="text-sm font-semibold text-gray-700">{expiryDate}</p>
          </div>

          {/* <button className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors active:scale-95">
            Upgrade
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRowCard;
