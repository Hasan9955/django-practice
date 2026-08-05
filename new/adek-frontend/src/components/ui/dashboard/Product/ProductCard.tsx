import React from "react";
import { Star } from "lucide-react"; // or any other star icon library

interface ProductCardProps {
	title: string;
	rating: number;
	soldCount: number;
	price: number;
	currency?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
	title = "G-shork B343 Indo version",
	rating = 5,
	soldCount = 1000,
	price = 16556,
	currency = "BDT",
}) => {
	// Format the sold count to show "+" if over 1000
	const formattedSoldCount =
		soldCount >= 1000
			? `${Math.floor(soldCount / 1000)}k+ Sold`
			: `${soldCount}+ Sold`;

	// Format price with currency
	const formattedPrice = new Intl.NumberFormat("en-US").format(price);

	return (
		<div className="max-w-xs p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
			<div className="space-y-2">
				{/* Product Title */}
				<h3 className="text-lg font-medium text-gray-900">{title}</h3>

				{/* Rating and Sold Count */}
				<div className="flex items-center gap-1">
					<div className="flex">
						{[...Array(5)].map((_, i) => (
							<Star
								key={i}
								size={16}
								fill={i < rating ? "#F59E0B" : "#E5E7EB"}
								className="text-yellow-500"
							/>
						))}
					</div>
					<span className="text-sm text-gray-600">{formattedSoldCount}</span>
				</div>

				{/* Price */}
				<p className="text-xl font-semibold text-gray-900">
					{currency} {formattedPrice}
				</p>
			</div>
		</div>
	);
};

export default ProductCard;
