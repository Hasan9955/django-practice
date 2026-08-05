import { CartData } from "@/types/cartType";
import React from "react";


const DIncreaseDecrease = ({
	data,
	cartItem,
	setCartItem,
}: {
	data: CartData;
	cartItem: CartData[];
	setCartItem: React.Dispatch<React.SetStateAction<CartData[]>>;
}) => {
	return (
		<div className="flex items-center gap-2 mt-2">
			<button
				className="border border-gray-300 px-2"
				onClick={() => {
					if (data.quantity > 1) {
						// Decrease the quantity and update the cart
						const updatedCart = cartItem.map((item) =>
							item.productId === data.productId
								? { ...item, quantity: item.quantity - 1 }
								: item
						);
						setCartItem(updatedCart);
						localStorage.setItem("cart", JSON.stringify(updatedCart));
					}
				}}
			>
				--
			</button>
			<span>{data.quantity}</span>
			<button
				className="border border-gray-300 px-2"
				onClick={() => {
					// Increase the quantity and update the cart
					const updatedCart = cartItem.map((item) =>
						item.productId === data.productId
							? { ...item, quantity: item.quantity + 1 }
							: item
					);
					setCartItem(updatedCart);
					localStorage.setItem("cart", JSON.stringify(updatedCart));
				}}
			>
				+
			</button>
		</div>
	);
};

export default DIncreaseDecrease;
