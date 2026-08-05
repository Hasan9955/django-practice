const FooterSing = () => {
	return (
		<div className="p-6 bg-[#F4F4F4] rounded-[4px] md:flex-row flex-col gap-4 md:gap-0 flex items-center justify-between w-full md:mb-10 mb-8 lg:mb-[98px]">
			<div className="gap-4">
				<h6 className="text-[24px] text-[#000] font-medium font-inter">
					SIGN UP & SAVE UPTO: 25% OFF
				</h6>
				<p className="text-base font-nun font-medium text-[#434343]">
					Be the first to hear about new products & deals.
				</p>
			</div>
			<div>
				<button className="text-base font-normal text-[#007BFF] px-[54px] py-[14px] border-[1px] border-[#007BFF]  rounded-[4px]">
					Sign in
				</button>
			</div>
		</div>
	);
};

export default FooterSing;
