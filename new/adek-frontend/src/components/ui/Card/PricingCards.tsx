"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button/Button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/Card/Cards";

interface PricingCardProps {
	name: string;
	description: string;
	price: number;
	currency: string;
	features: string[];
	popular?: boolean;
	onSelect: () => void;
}

export function PricingCard({
	name,
	description,
	price,
	currency,
	features,
	popular = false,
	onSelect,
}: PricingCardProps) {
	return (
		<Card
			className={cn(
				"relative overflow-hidden border",
				popular ? "bg-blue-50 border-blue-100" : "bg-white border-gray-200"
			)}
		>
			{popular && (
				<div className="absolute top-0 right-0">
					<div className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rotate-45 translate-x-8 translate-y-3">
						Most Popular
					</div>
				</div>
			)}
			<CardHeader className="pb-0">
				<div className="flex items-center space-x-2">
					{!popular && (
						<div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
							<span className="text-white text-xs">P</span>
						</div>
					)}
					{popular && (
						<div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
							<span className="text-yellow-800 text-xs">★</span>
						</div>
					)}
					<h3 className="text-lg font-semibold">{name}</h3>
				</div>
				<p className="text-sm text-gray-600 mt-2">{description}</p>
			</CardHeader>
			<CardContent className="pt-6">
				<ul className="space-y-3">
					{features.map((feature, index) => (
						<li key={index} className="flex items-start">
							<Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
							<span className="text-sm">{feature}</span>
						</li>
					))}
				</ul>
			</CardContent>
			<CardFooter className="flex items-center justify-between pt-6">
				<div className="flex items-baseline">
					<span className="text-2xl font-bold">
						{currency}
						{price}
					</span>
					<span className="text-sm text-gray-600 ml-1">/month</span>
				</div>
				<Button
					onClick={onSelect}
					variant={popular ? "default" : "outline"}
					className={cn(
						"rounded-full",
						popular ? "bg-blue-600 hover:bg-blue-700" : "border-gray-300"
					)}
					size="icon"
				>
					<ChevronRight className="h-5 w-5" />
				</Button>
			</CardFooter>
		</Card>
	);
}
