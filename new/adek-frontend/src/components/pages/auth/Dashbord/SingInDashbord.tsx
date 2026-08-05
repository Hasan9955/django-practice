"use client";

import type React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/ui/Logo/Logo";
import { useAdminLoginMutation } from "@/redux/features/auth/authApi";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setToken } from "@/redux/features/auth/authSlice";
// import { setToken } from "@/redux/features/auth/authSlice";

export default function SingInDashbord() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useAdminLoginMutation();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Logging in...");
    try {
      const result = await login({ email, password }).unwrap();
      // Extract token from API response
      const token = result?.result?.accessToken;
      console.log(token);
      if (!token) throw new Error("No token received");
      // 1. Save in Redux
      dispatch(setToken(token));
      // 3. Success toast
      toast.success("Logged in", { id: toastId, duration: 2000 });
      
      // 4. Redirect
      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      toast.error("Login failed. Please check your credentials.", {
        id: toastId,
      });
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-[#F6F6F6]">
      <div className="flex flex-col items-center justify-between p-12 w-[588px] h-[490px] bg-[#FFFFFF] rounded-[8px]">
        <div className="flex items-center justify-center">
          <Logo />
        </div>

        <div className="text-[40px] font-inter font-normal  text-center text-gray-900">
          Welcome to back
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-2 bg-gray-100 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-2 bg-gray-100 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-1 right-0 flex items-center pr-3 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-6 h-5" />
              ) : (
                <Eye className="w-6 h-5" />
              )}
            </button>
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-501 hover:text-blue-500"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
