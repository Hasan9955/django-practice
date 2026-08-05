"use client";
import { BsArrowUp } from "react-icons/bs";

const BackToTop = () => {
	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="flex justify-center items-center py-4 sm:py-7">
			<button
				onClick={scrollToTop}
				aria-label="Back to top"
				className=" flex  px-4 py-3 bg-[#000000]/20 rounded-[12px]  items-center text-[#242424] text-sm sm:text-[20px] font-nun font-semibold gap-2 "
			>
				Back to top <BsArrowUp className="text-xs sm:text-base" />
			</button>
		</div>
	);
};

export default BackToTop;
