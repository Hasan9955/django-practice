interface SellerCardProps {
	title: string;
	totalSellers: number;
	icon: React.ComponentType;
	subbgicon: string;
	bgicon: string;
}

const SellerCard: React.FC<SellerCardProps> = ({
	title,
	totalSellers,
	icon: IconComponent,
	subbgicon,
	bgicon,
}) => {
	return (
		<div className="rounded-[12px] border-[1px] border-[#E2E2E2] flex p-[20px_28px] items-start justify-between w-full">
			<div>
				<p className="text-[#5C595E] font-poppins text-[16px] font-normal">
					{title}
				</p>
				<h2 className="text-[#322F35] font-sans text-[28px] font-semibold">
					{totalSellers}
				</h2>
			</div>
			<div
				className={`w-10 h-10 rounded-full ${subbgicon} flex items-center justify-center`}
			>
				<div
					className={`${bgicon} h-[22px] w-[22px] flex items-center justify-center rounded-full`}
				>
					{IconComponent && <IconComponent />}
				</div>
			</div>
		</div>
	);
};

export default SellerCard;
