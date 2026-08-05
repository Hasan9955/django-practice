// components/OrderStatusCard.tsx

import { FC, ReactNode } from "react";

interface OrderStatusCardProps {
	label: string;
	count: number;
	icon: ReactNode;
}

const OrderStatusCard: FC<OrderStatusCardProps> = ({ label, count, icon }) => {
	return (
		<div className="flex flex-col items-center justify-center text-center  px-2">
			<div className="flex items-start gap-2 text-sm text-gray-500">
				<div className=" border-blue-primary border-[1px] rounded-full w-5 h-5 items-center justify-center flex">
					{icon}
				</div>
				<div className="flex flex-col  justify-start items-start">
					<p className="text-[#5C595E] font-normal text-[16px] font-sans">
						{label}
					</p>
					<h5 className="text-[#322F35] text-center mt-3 font-semibold text-[24px] font-sans">
						{count}
					</h5>
				</div>
			</div>
		</div>
	);
};

export default OrderStatusCard;
