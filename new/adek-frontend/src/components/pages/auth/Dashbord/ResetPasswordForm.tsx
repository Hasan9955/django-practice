"use client";

import type React from "react";

import { useState } from "react";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/ui/Logo/Logo";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import {
	Card,
	CardContent,
	CardHeader,
	CardFooter,
} from "@/components/ui/Card/Card";
import { Label } from "@/components/ui/Label/label";
import { Alert, AlertDescription } from "@/components/ui/Alert/alert";

export default function ResetPasswordForm() {
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState("");

	const validatePasswords = () => {
		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters long");
			return false;
		}
		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return false;
		}
		setError("");
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validatePasswords()) {
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log("Password reset successful");
			setIsSuccess(true);
		} catch (error) {
			console.error("Password reset error:", error);
			setError("Failed to reset password. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
		return (
			<Card className="w-full border-none shadow-sm">
				<CardHeader className="flex items-center justify-center pb-2 space-y-0">
					<Logo href="/" />
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex flex-col items-center space-y-2 text-center">
						<CheckCircle className="w-12 h-12 text-green-500" />
						<h1 className="text-2xl font-medium text-gray-900">
							Password changed!
						</h1>
					</div>

					<Alert className="bg-green-50 border-green-100">
						<AlertDescription>
							<p className="text-center text-gray-600">
								Your password has been successfully updated. You can now log in
								with your new password.
							</p>
						</AlertDescription>
					</Alert>
				</CardContent>
				<CardFooter>
					<Button asChild className="w-full bg-blue-500 hover:bg-blue-600">
						<Link href="/login">Continue to login</Link>
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<Card className="w-full border-none shadow-sm">
			<CardHeader className="flex items-center justify-center pb-2 space-y-0">
				<Logo href="/" />
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-medium text-gray-900">
						Reset your password
					</h1>
					<p className="text-gray-600">
						Choose a new password for your account.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<div className="relative">
							<Label htmlFor="new-password" className="sr-only">
								New Password
							</Label>
							<Input
								id="new-password"
								type={showNewPassword ? "text" : "password"}
								placeholder="New Password"
								className="bg-gray-100 border-none pr-10"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
							/>
							<button
								type="button"
								className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
								onClick={() => setShowNewPassword(!showNewPassword)}
								aria-label={
									showNewPassword ? "Hide new password" : "Show new password"
								}
							>
								{showNewPassword ? (
									<EyeOff className="w-5 h-5" />
								) : (
									<Eye className="w-5 h-5" />
								)}
							</button>
						</div>
					</div>

					<div className="space-y-2">
						<div className="relative">
							<Label htmlFor="confirm-password" className="sr-only">
								Confirm Password
							</Label>
							<Input
								id="confirm-password"
								type={showConfirmPassword ? "text" : "password"}
								placeholder="Confirm Password"
								className="bg-gray-100 border-none pr-10"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
							/>
							<button
								type="button"
								className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								aria-label={
									showConfirmPassword
										? "Hide confirm password"
										: "Show confirm password"
								}
							>
								{showConfirmPassword ? (
									<EyeOff className="w-5 h-5" />
								) : (
									<Eye className="w-5 h-5" />
								)}
							</button>
						</div>
					</div>

					{error && (
						<Alert className="bg-red-50 border-red-100">
							<AlertDescription className="text-red-600">
								{error}
							</AlertDescription>
						</Alert>
					)}

					<Button
						type="submit"
						className="w-full bg-blue-500 hover:bg-blue-600"
						disabled={isLoading}
					>
						{isLoading ? "Changing Password..." : "Change Password"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
