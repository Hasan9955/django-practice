
import { Button } from "@/components/ui/Button/Button";
import SalesAnalytics from "@/components/ui/dashboard/SalesAnalytics";
import { Crown } from "lucide-react";
import Link from "next/link";
import OrderHistory from "./OderHistory";

const DashboardPage = () => {


  return (
    <div>
      <div className="h-auto w-full">
        <SalesAnalytics
        />
      </div>

      <div className="w-full mx-auto my-7">
        <div className="bg-blue-500 rounded-[16px] px-12 py-8 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-white text-[28px] font-semibold font-inter mb-3">
              Ready to grow faster and sell smarter?
            </h2>
            <p className="text-[#F9F9F9] font-inter font-normal w-[527px] text-[12px] leading-relaxed">
              With Sellapp Pro, you get AI-driven insights, bulk product
              uploads, and advanced store controls—all designed to boost your
              sales and streamline your operations.
            </p>
          </div>
          <div className="ml-6">
            <Link href="/dashboard/sellapypro">
              <Button
                variant="secondary"
                className="bg-white text-gray-900 hover:bg-gray-100 flex items-center gap-2 px-5 py-3.5 rounded-md font-medium"
              >
                <Crown className="h-4 w-4 text-yellow-500" />
                <h6 className="text-base font-inter font-semibold text-[#1C1C1C]">
                  Upgrade plan
                </h6>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <OrderHistory />
    </div>
  );
};

export default DashboardPage;