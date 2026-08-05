/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/Card/Cards";
import {
  useGetSellerSubscriptionPlansQuery,
  useBuySellerSubscriptionPlanMutation,
} from "@/redux/features/dashborad/sellerdashboard/sellerDashboardApi";
import { KingIcon, StarterIcon } from "@/assets/svgIcon";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Skeleton } from "antd";
import { useGetOtherProfileQuery } from "@/redux/features/auth/authApi";
import SubscriptionCard from "@/components/ui/Card/SubscriptionCard";

export default function SellapyPro() {
  const { data, isLoading } = useGetSellerSubscriptionPlansQuery({});
  const [buySubscriptionPlan, { isLoading: isBuying }] =
    useBuySellerSubscriptionPlanMutation();

  const user = useAppSelector((state: RootState) => state.auth.user);
  const userId = user?.id;
  const { data: crentSubcription, isLoading: crentSubcriptionLoading } =
    useGetOtherProfileQuery(userId);
  console.log(crentSubcription, "crentSubcription");

  const handleSelectPlan = async (planId: string) => {
    try {
      const payload = {
        subscriptionId: planId,
        userId,
      };

      const res = await buySubscriptionPlan(payload).unwrap();

      if (res?.success) {
        if (res?.result?.checkoutUrl) {
          window.open(res.result.checkoutUrl, "_blank");
        }
        toast.success("Redirecting to checkout...");
      } else {
        toast.error(res?.message || "Failed to purchase plan");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const pricingPlans = data?.result || [];

  return (
    <>
      <div className="p-8 bg-gray-50">
        <h1 className="text-xl font-bold">Subscription & Billing</h1>
        <SubscriptionCard
          data={crentSubcription}
          isLoading={crentSubcriptionLoading}
        />
      </div>

      <div className="flex flex-wrap gap-6 w-full justify-center">
        {isLoading ? (
          <Skeleton active />
        ) : (
          pricingPlans.map((plan: any, index: number) => (
            <Card
              key={plan.id}
              className={cn(
                "relative overflow-hidden w-[400px] border flex flex-col items-start justify-between rounded-[8px]",
                index === 0
                  ? "bg-[#EAEDFF] border-[#2C4EFF] border-2 shadow-sm"
                  : "bg-white",
              )}
            >
              {/* Recommended Ribbon */}
              {index === 0 && (
                <div className="absolute -top-1 right-4">
                  <div className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rotate-45 translate-x-8 translate-y-3">
                    Advised
                  </div>
                </div>
              )}

              <CardHeader className="pb-0">
                <div className="">
                  <button
                    className={cn(
                      "py-1 px-4 text-sm text-start font-inter font-normal w-full rounded-full",
                      index === 0
                        ? "bg-[#FEF9C3] text-[#1E293B]"
                        : "bg-[#1E293B] text-white",
                    )}
                  >
                    {index === 0 ? "Most Popular" : "Standard"}
                  </button>
                </div>

                {/* Title and Icon */}
                <div className="flex items-center space-x-2">
                  {index === 0 ? (
                    <div className="p-1 rounded-full bg-[#FEF9C3] flex items-center justify-center">
                      <span className="text-yellow-800 text-xs">
                        <StarterIcon />
                      </span>
                    </div>
                  ) : (
                    <div className="p-1 rounded-full bg-[#1E293B] flex items-center justify-center">
                      <span className="text-white text-xs">
                        <KingIcon />
                      </span>
                    </div>
                  )}

                  <h3 className="text-[22px] text-[#000] font-semibold">
                    {plan.title}
                  </h3>
                </div>

                {plan.heading && (
                  <p className="text-sm text-[#22242D] font-inter mt-3">
                    {plan.heading}
                  </p>
                )}
              </CardHeader>

              {/* Features */}
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature: any, i: number) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-[#000000] mr-2 shrink-0" />
                      <span className="text-sm font-inter">{feature.key}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              {/* Footer */}
              <CardFooter className="block w-full pt-6">
                <div className="flex items-center justify-between border-t border-gray-300 mt-4 pt-4">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">${plan.price}</span>
                    <span className="text-sm text-gray-600 ml-1">
                      /{plan.interval}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isBuying}
                    variant={index === 0 ? "default" : "outline"}
                    className={cn(
                      "rounded-full transition-all",
                      index === 0
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border-gray-300",
                    )}
                    size="icon"
                  >
                    {isBuying ? (
                      <span className="text-xs animate-pulse">...</span>
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
