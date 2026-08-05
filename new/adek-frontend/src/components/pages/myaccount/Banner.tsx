import { FaAngleRight } from "react-icons/fa6";

const Banner = () => {
	return (
		<div className="bg-[#E6F2FF] py-16">
			<div className="container lg:px-16 md:px-14 sm:px-10 px-6 xl:px-0 mx-auto  h-auto flex  flex-col justify-center items-center gap-2">
				<h2 className="text-[40px] font-nun font-bold text-center text-[#1C1C1E]">
					My Account
				</h2>
				<div className="flex items-center gap-8">
					<p className="text-base text-[#1C1C1E] font-nun font-normal ">Home</p>
					<FaAngleRight />
					<h5 className=" font-nun font-bold text-[#04290F] text-[20px]">
						My Account
					</h5>
				</div>
			</div>
		</div>
	);
};

export default Banner;
