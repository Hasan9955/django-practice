export interface Product {
	id: number;
	name: string;
	brand: string;
	price: number;
	originalPrice: number;
	rating: number;
	reviews: string;
	image: string | StaticImageData;
	status: string;
	isWishlisted: boolean;
}

// Using a placeholder image URL for all products. Replace with your real images if needed.
import productimg from "@/assets/images/store/productimg.png";
import { StaticImageData } from "next/image";

export const products: Product[] = [
	{
		id: 1,
		name: "Oversized T-shirt",
		brand: "Al Karam",
		price: 11.0,
		originalPrice: 14.0,
		rating: 5,
		reviews: "(4.1k) Customer Reviews",
		image: productimg,
		status: "Almost Sold Out",
		isWishlisted: false,
	},
	{
		id: 2,
		name: "Oversized T-shirt",
		brand: "Al Karam",
		price: 11.0,
		originalPrice: 14.0,
		rating: 5,
		reviews: "(4.1k) Customer Reviews",
		image: productimg,
		status: "Almost Sold Out",
		isWishlisted: false,
	},
	{
		id: 3,
		name: "Oversized T-shirt",
		brand: "Al Karam",
		price: 11.0,
		originalPrice: 14.0,
		rating: 5,
		reviews: "(4.1k) Customer Reviews",
		image: productimg,
		status: "Almost Sold Out",
		isWishlisted: false,
	},
	{
		id: 4,
		name: "Oversized T-shirt",
		brand: "Al Karam",
		price: 11.0,
		originalPrice: 14.0,
		rating: 5,
		reviews: "(4.1k) Customer Reviews",
		image: productimg,
		status: "Almost Sold Out",
		isWishlisted: false,
	},
	{
		id: 5,
		name: "Oversized T-shirt",
		brand: "Al Karam",
		price: 11.0,
		originalPrice: 14.0,
		rating: 5,
		reviews: "(4.1k) Customer Reviews",
		image: productimg,
		status: "Almost Sold Out",
		isWishlisted: false,
	},
	{
		id: 6,
		name: "Oversized T-shirt",
		brand: "Al Karam",
		price: 11.0,
		originalPrice: 14.0,
		rating: 5,
		reviews: "(4.1k) Customer Reviews",
		image: productimg,
		status: "Almost Sold Out",
		isWishlisted: false,
	},
	{
		id: 7,
		name: "Oversized T-shirt",
		brand: "Al Karam",
		price: 11.0,
		originalPrice: 14.0,
		rating: 5,
		reviews: "(4.1k) Customer Reviews",
		image: productimg,
		status: "Almost Sold Out",
		isWishlisted: false,
	},
	{
		id: 8,
		name: "Oversized T-shirt",
		brand: "Al Karam",
		price: 11.0,
		originalPrice: 14.0,
		rating: 5,
		reviews: "(4.1k) Customer Reviews",
		image: productimg,
		status: "Almost Sold Out",
		isWishlisted: false,
	},
	{
		id: 9,
		name: "Oversized T-shirt",
		brand: "Al Karam",
		price: 11.0,
		originalPrice: 14.0,
		rating: 5,
		reviews: "(4.1k) Customer Reviews",
		image: productimg,
		status: "Almost Sold Out",
		isWishlisted: false,
	},
];
