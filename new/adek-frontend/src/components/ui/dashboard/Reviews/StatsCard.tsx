import type React from "react";
interface StatsCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	children?: React.ReactNode;
}

export default function StatsCard({
	title,
	value,
	subtitle,
	children,
}: StatsCardProps) {
	return (
		<div className="bg-white rounded-lg p-6 shadow-sm">
			<h3 className="text-center font-medium text-lg mb-2">{title}</h3>
			<div className="flex flex-col items-center">
				<p className="text-2xl font-bold">{value}</p>
				{children && <div className="my-1">{children}</div>}
				{subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
			</div>
		</div>
	);
}
