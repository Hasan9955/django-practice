import Image, { StaticImageData } from "next/image";
import React from "react";

interface OrderCardProps {
	orderId: string;
	totalPayment: string;
	paymentMethod: string;
	estimatedDelivery: string;
	productImage: StaticImageData;
	productName: string;
	orderStatus: "Accepted" | "Pending" | "Shipped" | "Delivered";
	trackingStatus: string;
}

const OrderCard: React.FC<OrderCardProps> = ({
	orderId,
	totalPayment,
	paymentMethod,
	estimatedDelivery,
	productImage,
	productName,
	orderStatus,
	trackingStatus,
}) => {
	return (
		<div className="p-[14px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] rounded-[8px] mt-10">
			{/* Order Summary Row */}
			<div className="flex justify-between items-center">
				<OrderDetailItem label="Order ID" value={orderId} />
				<OrderDetailItem label="Total Payment" value={totalPayment} />
				<OrderDetailItem label="Payment Method" value={paymentMethod} />
				<OrderDetailItem label="Estimated Delivery" value={estimatedDelivery} />
			</div>

			{/* Product Details Row */}
			<div className="mt-8 flex gap-6">
				{/* Product Image and Tracking */}
				<div className="w-[282px]">
					<Image src={productImage} alt={productName} />
					<h2 className="text-[20px] mt-2 font-nun font-normal text-[#606060]">
						{trackingStatus}
					</h2>
					<button className="text-[20px] font-nun font-normal text-[#1E8BFF] border-[1px] border-[#1E8BFF] w-full py-3 px-6 rounded-[8px] mt-4">
						Track Order
					</button>
				</div>

				{/* Product Info and Status */}
				<div className="mt-6">
					<h4 className="text-[32px] font-nun font-normal text-[#1C1C1E]">
						{productName}
					</h4>

					<StatusBadge status={orderStatus} />

					<div className="w-full h-[5px] rounded-full bg-[#007BFF] mt-[76px]"></div>
					<h6 className="font-nun text-[#007BFF] font-semibold text-[20px] mt-2">
						{orderStatus === "Accepted" ? "Processing" : orderStatus}
					</h6>
				</div>
			</div>
		</div>
	);
};

// Sub-component for order detail items
interface OrderDetailItemProps {
	label: string;
	value: string;
}

const OrderDetailItem: React.FC<OrderDetailItemProps> = ({ label, value }) => (
	<div className="font-nun">
		<h6 className="font-semibold text-[24px] text-[#1C1C1E]">{label}</h6>
		<p className="text-base font-normal text-[#606060]">{value}</p>
	</div>
);

// Sub-component for status badge
interface StatusBadgeProps {
	status: OrderCardProps["orderStatus"];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
	const statusColors = {
		Accepted: "bg-[#3FC964]",
		Pending: "bg-yellow-500",
		Shipped: "bg-blue-500",
		Delivered: "bg-green-500",
	};

	return (
		<button
			className={`px-6 py-3 ${statusColors[status]} rounded-[8px] font-nun font-normal text-[20px] text-white mt-4`}
		>
			{status}
		</button>
	);
};

export default OrderCard;
