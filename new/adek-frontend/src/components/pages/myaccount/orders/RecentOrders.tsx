import OrderCard from "./OrderCard";
import productImage from "@/assets/images/profile/product.png";
const RecentOrders = () => {
	return (
		<div>
			<div>
				<div className="flex justify-between items-center mt-12">
					<h6 className="font-nun font-bold text-[40px] text-[#1C1C1E]">
						Recent Orders
					</h6>
					<p className="font-nun font-normal text-[32px] text-[#1C1C1E]">
						Download Invoice
					</p>
				</div>
				<div className="mb-[50px]">
					<OrderCard
						orderId="#SDGT254FD"
						totalPayment="$80"
						paymentMethod="Card"
						estimatedDelivery="29 Jul 2024"
						productImage={productImage}
						productName="Green Man Jacket"
						orderStatus="Accepted"
						trackingStatus="Estimated: 29 Jul 2024 (3 days remaining)"
					/>
					<OrderCard
						orderId="#SDGT254FD"
						totalPayment="$80"
						paymentMethod="Card"
						estimatedDelivery="29 Jul 2024"
						productImage={productImage}
						productName="Green Man Jacket"
						orderStatus="Pending"
						trackingStatus="Estimated: 29 Jul 2024 (3 days remaining)"
					/>
				</div>
			</div>
		</div>
	);
};

export default RecentOrders;
