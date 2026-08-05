import FooterSing from "../cart/FooterSing";

const CheckedOut = () => {
	return (
		<div className="container lg:px-16 md:px-14 sm:px-10 px-6 xl:px-0 mx-auto  h-auto lg:h-screen flex flex-col justify-between  ">
			<div className="flex md:pt-[68px] pt-8 flex-col md:flex-row justify-between items-start font-nun gap-4 md:gap-8">
				<div className="md:w-2/3 w-full">
					<div className="pt-8 px-6 pb-6 border-[1px] border-[#E4E9EE] rounded-[12px]">
						<h6 className="text-[20px] text-[#0B0F0E] font-normal">
							Add Debit Card
						</h6>
						<div className="mt-6 flex flex-col gap-4">
							<div className="flex gap-4 flex-col md:flex-row ">
								{" "}
								<div className="w-full">
									<p className="text-base text-[#0B0F0E] font-normal">
										Holder Name
									</p>
									<input
										type="text"
										placeholder="Enter your name"
										className="py-2.5 pl-4 rounded-[4px] border-[1px] border-[#E4E9EE]  w-full outline-none mt-2 "
									/>
								</div>
								<div className="w-full">
									<p className="text-base text-[#0B0F0E] font-normal">
										Card Number
									</p>
									<input
										type="Number"
										placeholder="0000 - 0000 - 0000 "
										className="py-2.5 pl-4 rounded-[4px] border-[1px] border-[#E4E9EE] mt-2  w-full outline-none "
									/>
								</div>
							</div>
							<div className="flex gap-4 flex-col md:flex-col ">
								{" "}
								<div className="w-full">
									<p className="text-base text-[#0B0F0E] font-normal">
										Expiry Date
									</p>
									<input
										type="date"
										placeholder="Select expiry date"
										className="py-2.5 pl-4 rounded-[4px] border-[1px] border-[#E4E9EE]  w-full outline-none mt-2 "
									/>
								</div>
								<div className="w-full">
									<p className="text-base text-[#0B0F0E] font-normal">CVV</p>
									<input
										type="text"
										placeholder="Enter your Cvv"
										className="py-2.5 pl-4 rounded-[4px] border-[1px] border-[#E4E9EE] mt-2  w-full outline-none "
									/>
								</div>
							</div>
							<div className="flex gap-4 md:flex-row flex-col justify-end items-end">
								<button className="text-base font-normal text-[#0B0F0E] px-[54px] py-3 bg-[#E4E9EE] rounded-[4px]">
									Cancel
								</button>{" "}
								<button className="text-base font-normal text-white px-[44px] py-3 bg-[#007BFF] rounded-[4px]">
									Checkout
								</button>
							</div>
						</div>
					</div>
				</div>
				<div className="md:w-1/3 w-full mb-6 md:mb-0">
					<div className="w-full pt-6 px-6 pb-8 rounded-[8px] border-[1px] border-[#E4E9EE]">
						<h4 className="text-[20px] text-[#0B0F0E] font-normal mb-6 ">
							Product Summary
						</h4>
						<div className="flex justify-between items-center text-base text-[#0B0F0E] font-normal mb-4">
							<h5>Green Man Jacket</h5>
							<p>$49</p>
						</div>
						<div className="flex justify-between items-center text-base text-[#0B0F0E] font-normal mb-4">
							<h5>Green Man Jacket</h5>
							<p>$49</p>
						</div>

						<div className="border-[1px] border-[#E4E9EE] my-6  w-full"></div>
						<div className="flex justify-between items-center text-base text-[#0B0F0E] font-normal mb-4">
							<h5 className="text-[#818B9C]">Total Price</h5>
							<p>$90</p>
						</div>
						<div className="flex justify-between items-center text-base text-[#0B0F0E] font-normal mb-4">
							<h5 className="text-[#818B9C]">
								Total Price (Shipping Discount)
							</h5>
							<p>-$20</p>
						</div>
						<div className="flex justify-between items-center text-base text-[#0B0F0E] font-normal ">
							<h5 className="text-[#818B9C]">Tax & Fee</h5>
							<p>$10</p>
						</div>
						<div className="border-[1px] border-[#E4E9EE] my-6  w-full"></div>
						<div className="text-[20px] text-[#0B0F0E] font-normal flex items-center justify-between">
							<h5>Total Price</h5>
							<p>$80</p>
						</div>
					</div>
				</div>
			</div>

			<div className="flex md:pt-10 pt-6 flex-col md:flex-row justify-between items-start font-nun gap-4 md:gap-8">
				<FooterSing />
			</div>
		</div>
	);
};

export default CheckedOut;
