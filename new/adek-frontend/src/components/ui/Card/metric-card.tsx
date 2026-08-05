import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Cards";
import { CardContent } from "./Card";
import { DorrelsIcon } from "@/assets/svgIcon";

interface MetricCardProps {
	title: string;
	value: string | number;
	icon: ReactNode;
	trend?: {
		value: string;
		type: "increase" | "decrease";
	};
	subtitle?: string;
	className?: string;
}

export function MetricCard({
	title,
	value,
	icon,
	trend,
	subtitle,
	className,
}: MetricCardProps) {
	return (
		<Card
			className={cn(
				"relative overflow-hidden group hover:shadow-md transition-all duration-300",
				className
			)}
		>
			<CardContent className="p-6">
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<p className="text-sm font-medium text-muted-foreground">{title}</p>
						<p className="text-2xl font-bold">
							{typeof value === "number" ? value.toLocaleString() : value}
						</p>

						{trend && (
							<div
								className={cn(
									"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
									trend.type === "increase"
										? "bg-green-100 text-green-800"
										: "bg-red-100 text-red-800"
								)}
							>
								
								<span className="">
									{trend.type === "increase" ? <DorrelsIcon /> : "↘"}
								</span>
							</div>
						)}

						{subtitle && (
							<p className="text-sm text-muted-foreground">{subtitle}</p>
						)}
					</div>

					<div className="relative">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white transition-all duration-300 ease-in-out hover:scale-110 hover:bg-blue-600 hover:shadow-lg group">
							<div>{icon}</div>
							<div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></div>
							<div className="absolute inset-0 rounded-full bg-blue-300 opacity-0 group-hover:opacity-10 animate-pulse"></div>
						</div>

						{/* Floating animation */}
						<div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-30 blur-sm transition-all duration-300 animate-scale"></div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
