import AllAdsPromotion from "@/components/pages/dashboard/adminDashboard/monetization&promotions/AllAdsPromotion";
import React from "react";

const page = () => {
	return (
		<div className="rounded-[16px] border border-[#CACACA] inline-flex p-6 flex-col items-start gap-8 flex-shrink-0 w-full">
			<h3 className="text-black font-nun text-[32px] font-bold">
				All ads and promotion
			</h3>
            <AllAdsPromotion/>
		</div>
	);
};

export default page;
