/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { setUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { handleAsyncWithToast } from "@/utils/handleAsyncWithToast";
import { verifyToken } from "@/utils/verifyToken";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLoginWithSocialMutation } from "@/redux/features/auth/authApi";
import { Button } from "@/components/ui/Button/Button";

const LoginWithGoogle = () => {
	const { data: session } = useSession();
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { user } = useAppSelector((state) => state.auth);
	const [googleLogin] = useLoginWithSocialMutation();
	const [loading, setLoading] = useState(false);

	const handleGoogleLogin = async () => {
		try {
			setLoading(true);

			if (!session?.user) {
				await signIn("GOOGLE", { redirect: false });
				return;
			}

			const userData = {
				email: session.user?.email || "",
				fullName: session.user?.name || "",
				socialLoginType: "GOOGLE",
			};

			console.log(userData, " userData");

			const loginResponse = await handleAsyncWithToast(
				() => googleLogin(userData),
				"Signing in with Google..."
			);

			console.log(loginResponse, " loginResponse");

			if (!loginResponse?.data?.success) {
				throw new Error("Google login failed");
			}

			const user = await verifyToken(loginResponse.data.data.accessToken);

			dispatch(
				setUser({
					user,
					access_token: loginResponse.data.data.accessToken,
				})
			);

			router.push("/");
			router.refresh();
		} catch (error) {
			console.error("Google login error:", error);
			toast.error("Google login failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// ✅ NEW: Automatically run if session exists but Redux user is missing
	useEffect(() => {
		if (session?.user && !user) {
			handleGoogleLogin();
		}
	}, [session?.user]);

	return (
		<Button
			onClick={handleGoogleLogin}
			disabled={loading}
			variant="outline"
			className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 bg-transparent cursor-pointer"
		>
			<svg className="w-5 h-5" viewBox="0 0 24 24">
				<path
					fill="#4285F4"
					d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
				/>
				<path
					fill="#34A853"
					d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				/>
				<path
					fill="#FBBC05"
					d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				/>
				<path
					fill="#EA4335"
					d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				/>
			</svg>
			<span>{loading ? "Signing in..." : "Google"}</span>
		</Button>
	);
};

export default LoginWithGoogle;
