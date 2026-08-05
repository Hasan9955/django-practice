"use client";
import { Globe, Pencil } from "lucide-react"; // Import Pencil icon
import { cn } from "@/lib/utils";
import type { FieldError, UseFormRegister } from "react-hook-form";
import type { z } from "zod";
import {
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card/Card";
import TextArea from "antd/es/input/TextArea";

// Define a type for the form data to ensure type safety for register and errors
type FormData = z.infer<
	z.ZodObject<{
		shippingAddress: z.ZodString;
		sameAsShipping: z.ZodBoolean;
		billingAddress: z.ZodOptional<z.ZodString>;
	}>
>;

interface AddressSectionProps {
	title: string;
	description: string;
	textareaId: "shippingAddress" | "billingAddress";
	placeholder: string;
	register: UseFormRegister<FormData>;
	error?: FieldError;
	disabled?: boolean;
	onUpdateClick: () => void; // New prop for button click handler
	isSubmitting: boolean; // New prop to disable button during submission
}

export function AddressSection({
	title,
	description,
	textareaId,
	placeholder,
	register,
	error,
	disabled = false,
	onUpdateClick,
	isSubmitting,
}: AddressSectionProps) {
	return (
		<div className="space-y-4">
			<CardHeader className="p-0 pb-2">
				<CardTitle className="text-xl font-semibold">{title}</CardTitle>
				<CardDescription className="text-sm text-gray-500">
					{description}
				</CardDescription>
			</CardHeader>
			<div className="space-y-2">
				<label
					htmlFor={textareaId}
					className="flex items-center gap-2 text-base font-medium"
				>
					<Globe className="w-4 h-4 text-gray-600" />
					Address
				</label>
				<div className="relative">
					<TextArea
						id={textareaId}
						placeholder={placeholder}
						autoSize={false}
						style={{ height: 120 }}
						className={cn(
							"p-4 w-full resize-none bg-[#F2F2F2] rounded-md text-sm placeholder:text-gray-400",
							error && "!border-red-500 !focus:ring-red-500"
						)}
						{...register(textareaId)}
						aria-invalid={error ? "true" : "false"}
						disabled={disabled}
					/>
					<button
						type="button" // Changed to type="button" to prevent default form submission
						onClick={onUpdateClick} // Use the passed click handler
						className="absolute bottom-3 left-3 cursor-pointer hover:bg-white  px-4 py-2 text-sm text-[#656565] font-nun text-[12px] font-medium flex h-[28px]  items-center gap-[8px] rounded-[8px] border-[1px] border-[#CCC]"
						disabled={disabled || isSubmitting} // Disable if field is disabled or form is submitting
					>
						<Pencil className="w-4 h-4 mr-2" />
						Update
					</button>
				</div>
				{error && (
					<p className="text-sm text-red-500" role="alert">
						{error.message}
					</p>
				)}
			</div>
		</div>
	);
}
