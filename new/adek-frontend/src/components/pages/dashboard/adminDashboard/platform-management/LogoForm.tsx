"use client";

import type React from "react";

import { useState, useRef } from "react";
import {
	useCreateLogoMutation,
	useUpdateLogoMutation,
} from "@/redux/features/logo/logoSlice";
import Image from "next/image";
import { Label } from "@/components/ui/Label/label";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";

// Import or define the Logo type
// Example import (adjust the path as needed):
// import type { Logo } from "@/types/logo";

// If you don't have a Logo type, define it here:
type Logo = {
	id: string;
	name: string;
	preview?: string;
};

interface LogoFormProps {
	logo?: Logo | null;
	onClose: () => void;
}

export default function LogoForm({ logo, onClose }: LogoFormProps) {
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string>(logo?.preview || "");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [createLogo, { isLoading: isCreating }] = useCreateLogoMutation();
	const [updateLogo, { isLoading: isUpdating }] = useUpdateLogoMutation();

	const isLoading = isCreating || isUpdating;
	const isEditing = !!logo;

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);

			// Create preview URL
			const reader = new FileReader();
			reader.onload = (e) => {
				setPreview(e.target?.result as string);
			};
			reader.readAsDataURL(selectedFile);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isEditing && !file) {
			alert("Please select a logo file");
			return;
		}

		try {
			if (isEditing && logo) {
				await updateLogo({
					id: logo.id,
					name: logo.name,
					...(file && { file }),
				}).unwrap();
			} else if (file) {
				await createLogo({
					name: file.name.split(".")[0] || "Logo",
					file,
				}).unwrap();
			}

			onClose();
		} catch (error) {
			console.error("Failed to save logo:", error);
			alert("Failed to save logo. Please try again.");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="file">Select Logo File</Label>
				<Input
					id="file"
					type="file"
					accept="image/*"
					onChange={handleFileChange}
					ref={fileInputRef}
					{...(!isEditing && { required: true })}
				/>
				{isEditing && (
					<p className="text-sm text-muted-foreground">
						Leave empty to keep current file
					</p>
				)}
			</div>

			{preview && (
				<div className="space-y-2">
					<Label>Preview</Label>
					<div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
						<Image
							src={preview}
							alt="Logo preview"
							className="max-w-full max-h-full object-contain"
							width={301}
							height={182}
						/>
					</div>
				</div>
			)}

			<div className="flex gap-2 pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={onClose}
					disabled={isLoading}
					className="flex-1 bg-transparent"
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isLoading} className="flex-1">
					{isLoading ? "Saving..." : isEditing ? "Update" : "Add Logo"}
				</Button>
			</div>
		</form>
	);
}
