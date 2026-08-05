"use client";

import { useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";

interface ActionButtonsProps {
	onToggleVisibility?: (isVisible: boolean) => void;
	onDelete?: () => void;
	initialVisibility?: boolean;
	className?: string;
}

export default function ActionButtons({
	onToggleVisibility,
	onDelete,
	initialVisibility = true,
	className = "",
}: ActionButtonsProps) {
	const [isVisible, setIsVisible] = useState(initialVisibility);

	const handleToggleVisibility = () => {
		const newVisibility = !isVisible;
		setIsVisible(newVisibility);
		onToggleVisibility?.(newVisibility);
	};

	const handleDelete = () => {
		onDelete?.();
	};

	return (
		<div
			className={` inline-block items-center gap-1 p-2 bg-white border border-gray-200 rounded-[8px] shadow-sm ${className}`}
		>
			<Button
				variant="ghost"
				size="sm"
				onClick={handleToggleVisibility}
				className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2"
				title={isVisible ? "Hide" : "Show"}
			>
				{isVisible ? (
					<Eye className="h-4 w-4" />
				) : (
					<EyeOff className="h-4 w-4" />
				)}
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={handleDelete}
				className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2"
				title="Delete"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}
