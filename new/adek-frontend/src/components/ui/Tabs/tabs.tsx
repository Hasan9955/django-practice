"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextType {
	value: string;
	onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
	const context = React.useContext(TabsContext);
	if (!context) {
		throw new Error("Tabs components must be used within a Tabs provider");
	}
	return context;
};

interface TabsProps {
	defaultValue?: string;
	defaultActiveKey?: string; // Add this line
	value?: string;
	activeKey?: string; // Add this line
	onValueChange?: (value: string) => void;
	onActiveKeyChange?: (key: string) => void; // Add this line
	children: React.ReactNode;
	className?: string;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
	(
		{
			defaultValue,
			defaultActiveKey,
			value,
			activeKey,
			onValueChange,
			onActiveKeyChange,
			children,
			className,
			...props
		},
		ref
	) => {
		// Use defaultActiveKey as fallback for defaultValue
		const initialValue = defaultValue || defaultActiveKey || "";
		const [internalValue, setInternalValue] = React.useState(initialValue);

		// Use activeKey as fallback for value
		const currentValue =
			value !== undefined
				? value
				: activeKey !== undefined
				? activeKey
				: internalValue;

		// Use onActiveKeyChange as fallback for onValueChange
		const handleValueChange =
			onValueChange || onActiveKeyChange || setInternalValue;

		return (
			<TabsContext.Provider
				value={{ value: currentValue, onValueChange: handleValueChange }}
			>
				<div ref={ref} className={cn("w-full", className)} {...props}>
					{children}
				</div>
			</TabsContext.Provider>
		);
	}
);
Tabs.displayName = "Tabs";

interface TabsListProps {
	children: React.ReactNode;
	className?: string;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
	({ children, className, ...props }, ref) => (
		<div
			ref={ref}
			role="tablist"
			className={cn(
				"inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps {
	value: string;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
	({ value, children, className, disabled, ...props }, ref) => {
		const { value: selectedValue, onValueChange } = useTabsContext();
		const isSelected = selectedValue === value;

		const handleClick = () => {
			if (!disabled) {
				onValueChange(value);
			}
		};

		const handleKeyDown = (event: React.KeyboardEvent) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				handleClick();
			}
		};

		return (
			<button
				ref={ref}
				role="tab"
				aria-selected={isSelected}
				aria-controls={`tabpanel-${value}`}
				tabIndex={isSelected ? 0 : -1}
				disabled={disabled}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				className={cn(
					"inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
					isSelected
						? "bg-background text-foreground shadow-sm"
						: "hover:bg-muted/50",
					className
				)}
				{...props}
			>
				{children}
			</button>
		);
	}
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps {
	value: string;
	children: React.ReactNode;
	className?: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
	({ value, children, className, ...props }, ref) => {
		const { value: selectedValue } = useTabsContext();
		const isSelected = selectedValue === value;

		if (!isSelected) {
			return null;
		}

		return (
			<div
				ref={ref}
				role="tabpanel"
				id={`tabpanel-${value}`}
				aria-labelledby={`tab-${value}`}
				tabIndex={0}
				className={cn(
					"mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					className
				)}
				{...props}
			>
				{children}
			</div>
		);
	}
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
