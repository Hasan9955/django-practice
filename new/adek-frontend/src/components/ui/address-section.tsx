/* eslint-disable @typescript-eslint/no-unused-vars */

import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Textarea } from "./Textarea/textarea";
import { Label } from "./Label/label";

interface AddressSectionProps {
  title: string;
  description: string;
  textareaId: string;
  placeholder: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  disabled?: boolean;
  onUpdateClick?: () => void;
  isSubmitting?: boolean;
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
  isSubmitting = false,
}: AddressSectionProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor={textareaId} className="text-base font-semibold text-foreground">
          {title}
        </Label>
        <p className="text-sm text-foreground/60">{description}</p>
      </div>
      <Textarea
        id={textareaId}
        placeholder={placeholder}
        {...register}
        disabled={disabled}
        className="min-h-24 resize-none border border-input rounded-md bg-background px-3 py-2 text-base placeholder:text-foreground/40 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {error && (
        <p className="text-sm text-destructive font-medium">{error.message}</p>
      )}
    </div>
  );
}
