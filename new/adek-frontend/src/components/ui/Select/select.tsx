/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface SelectProps {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	children: React.ReactNode;
	className?: string;
}

interface SelectItemProps {
	value: string;
	children: React.ReactNode;
	disabled?: boolean;
	className?: string;
}

interface SelectContextType {
	value?: string;
	onValueChange?: (value: string) => void;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	placeholder?: string;
}

const SelectContext = React.createContext<SelectContextType | undefined>(
	undefined
);

const useSelectContext = () => {
	const context = React.useContext(SelectContext);
	if (!context) {
		throw new Error("Select components must be used within a Select");
	}
	return context;
};

// Main Select Component
const Select: React.FC<SelectProps> = ({
	value,
	defaultValue,
	onValueChange,
	placeholder,
	disabled = false,
	children,
	className,
}) => {
	const [internalValue, setInternalValue] = React.useState(defaultValue || "");
	const [isOpen, setIsOpen] = React.useState(false);
	const selectRef = React.useRef<HTMLDivElement>(null);

	const currentValue = value !== undefined ? value : internalValue;

	const handleValueChange = React.useCallback(
		(newValue: string) => {
			if (value === undefined) {
				setInternalValue(newValue);
			}
			onValueChange?.(newValue);
			setIsOpen(false);
		},
		[value, onValueChange]
	);

	// Close dropdown when clicking outside
	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				selectRef.current &&
				!selectRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			// Prevent body overflow when select is open
			document.body.style.overflowX = "hidden";
		} else {
			// Restore body overflow when select is closed
			document.body.style.overflowX = "";
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.body.style.overflowX = "";
		};
	}, [isOpen]);

	// Close on escape key
	React.useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen]);

	return (
		<SelectContext.Provider
			value={{
				value: currentValue,
				onValueChange: handleValueChange,
				isOpen,
				setIsOpen,
				placeholder,
			}}
		>
			<div
				ref={selectRef}
				className={cn("relative w-full", className)}
				data-select-container
			>
				{children}
			</div>
		</SelectContext.Provider>
	);
};

// Select Trigger
const SelectTrigger = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => {
	const { isOpen, setIsOpen, placeholder } = useSelectContext();

	return (
		<button
			ref={ref}
			type="button"
			className={cn(
				"flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			onClick={() => setIsOpen(!isOpen)}
			{...props}
		>
			<span className="block truncate">
				{children || placeholder || "Select..."}
			</span>
			<ChevronDown
				className={cn(
					"h-4 w-4 opacity-50 transition-transform duration-200",
					isOpen && "rotate-180"
				)}
			/>
		</button>
	);
});
SelectTrigger.displayName = "SelectTrigger";

// Select Value (shows selected value)
const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
	const { value, placeholder: contextPlaceholder } = useSelectContext();

	if (!value) {
		return (
			<span className="text-muted-foreground">
				{placeholder || contextPlaceholder || "Select..."}
			</span>
		);
	}

	return <span>{value}</span>;
};

// Select Content (dropdown container)
const SelectContent: React.FC<{
	children: React.ReactNode;
	className?: string;
}> = ({ children, className }) => {
	const { isOpen } = useSelectContext();
	const contentRef = React.useRef<HTMLDivElement>(null);

	// Get trigger element position when dropdown opens
	const getTriggerPosition = React.useCallback(() => {
		const selectContainer = contentRef.current?.closest(
			"[data-select-container]"
		) as HTMLElement;
		if (!selectContainer) return null;

		const triggerElement = selectContainer.querySelector("button");
		if (!triggerElement) return null;

		return triggerElement.getBoundingClientRect();
	}, []);

	if (!isOpen) return null;

	return (
		<>
			{/* Portal-like overlay */}
			<div className="fixed inset-0 z-40" style={{ pointerEvents: "none" }} />
			<div
				ref={contentRef}
				className={cn(
					"absolute z-50 mt-1 max-h-96 w-full overflow-hidden rounded-md border bg-white shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
					"dark:bg-gray-900 dark:border-gray-700 dark:text-white",
					className
				)}
				style={{
					minWidth: "100%",
					maxWidth: "calc(100vw - 2rem)",
					boxSizing: "border-box",
				}}
			>
				<div className="p-1 max-h-[300px] overflow-y-auto overflow-x-hidden">
					{children}
				</div>
			</div>
		</>
	);
};

// Select Item
const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
	({ value, children, disabled = false, className, ...props }, ref) => {
		const { value: selectedValue, onValueChange } = useSelectContext();
		const isSelected = selectedValue === value;

		const handleClick = () => {
			if (!disabled) {
				onValueChange?.(value);
			}
		};

		return (
			<div
				ref={ref}
				className={cn(
					"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
					disabled && "pointer-events-none opacity-50",
					isSelected && "bg-accent text-accent-foreground",
					className
				)}
				onClick={handleClick}
				{...props}
			>
				<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
					{isSelected && <Check className="h-4 w-4" />}
				</span>
				<span className="block truncate">{children}</span>
			</div>
		);
	}
);
SelectItem.displayName = "SelectItem";

// Select Group (for grouping items)
const SelectGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return <div role="group">{children}</div>;
};

// Select Label (for group labels)
const SelectLabel: React.FC<{
	children: React.ReactNode;
	className?: string;
}> = ({ children, className }) => {
	return (
		<div
			className={cn(
				"py-1.5 pl-8 pr-2 text-sm font-semibold text-muted-foreground",
				className
			)}
		>
			{children}
		</div>
	);
};

// Select Separator
const SelectSeparator: React.FC<{ className?: string }> = ({ className }) => {
	return <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />;
};

export {
	Select,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectLabel,
	SelectItem,
	SelectSeparator,
};
