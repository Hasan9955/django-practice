// components/Button.tsx
import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps {
	label: string;
	size?: "small" | "medium" | "large";
	className?: string;
	type?: "button" | "submit" | "reset"; // Add type prop
	onClick?: () => void;
	disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
	label,
	size = "medium",
	className,
	type = "button", // Default to "button"
	onClick,
	disabled = false,
}) => {
	const sizeClasses: Record<string, string> = {
		small: "px-6 py-3 text-sm",
		medium: "px-8 py-3 text-base",
		large: "px-8 py-4 text-xl",
	};

	return (
		<button
			type={type} // Use the type prop
			onClick={onClick} // Attach the onClick handler if provided
			disabled={disabled}
			className={cn(`rounded-lg font-semibold ${sizeClasses[size]}`, className)}
		>
			{label}
		</button>
	);
};

export default Button;
