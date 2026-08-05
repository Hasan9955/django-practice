// import LoginWithGoogle from '@/components/LoginWithGoogle';
import Banner from "@/components/pages/home/Banner/Banner";
import Banner2 from "@/components/pages/home/Banner/Banner2";
import BestChoisePlan from "@/components/pages/home/BestChoise/BestChoisePlan";
import MoreProductsToExplore from "@/components/pages/home/MoreProductsToExplore/MoreProductsToExplore";
import PopularCategories from "@/components/pages/home/PopularCateogories/PopularCategories";
import ExplorePopularStores from "@/components/pages/home/PopularStore/PopularStore";
import SalesCard from "@/components/pages/home/SalesCard/SalesCard";
import TimelessEligence from "@/components/pages/home/TimelessEligence/TimelessEligence";
import BackToTop from "@/components/pages/product/ProductDetails/BackToTop";
import React from "react";

const page = () => {
	return (
		<div className="font-nun bg-[#f6f6f6]">
			<Banner />
			<Banner2 />
			<TimelessEligence />
			<PopularCategories />
			<ExplorePopularStores />
			<SalesCard />
			<MoreProductsToExplore />
			<BestChoisePlan />
			<div className="bg-white">
				<BackToTop />
			</div>
		</div>
	);
};

export default page;
