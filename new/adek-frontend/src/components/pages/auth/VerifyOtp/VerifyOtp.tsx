/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Form, Button } from "antd";
import regBg from "@/assets/images/auth/verifyOtp.png";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useVerifyOtpMutation,
  useSendOtpMutation,
} from "@/redux/features/auth/authApi";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { selectSignupEmail, setUser } from "@/redux/features/auth/authSlice";
import Image from "next/image";
import Logo from "@/components/ui/Logo/Logo";
import toast from "react-hot-toast";
import { useAppSelector } from "@/lib/currencies/hooks";

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

const VerifyOtp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "SIGNUP_OTP_SECRET";

  const {
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const [verifyOtp, { isLoading, isError, isSuccess }] = useVerifyOtpMutation();
  const [sendOtp, { isLoading: isResending }] = useSendOtpMutation();
  const dispatch = useDispatch();
  const email = useAppSelector((state) => selectSignupEmail(state));
  console.log(email, "user email");

  const onSubmit = async (formData: OtpFormValues) => {
    try {
      const result = await verifyOtp({ otp: formData.otp, reason }).unwrap();
      if (result.access_token) {
        dispatch(setUser({ access_token: result.access_token }));
      }
      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
    } catch (err: any) {
      console.error("Failed to verify OTP:", err);
      const message =
        err?.data?.message ||
        err?.message ||
        "An unexpected error occurred during OTP verification.";
      setError("otp", { type: "manual", message });
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      toast.error(
        "Email address not found. Please restart the signup process.",
      );
      return;
    }
    try {
      // ✅ Use the same `reason` from search params, not a hardcoded value
      await sendOtp({ email, reason }).unwrap();
      // ✅ Don't call setUser here — resending OTP doesn't change auth state
      toast.success("OTP resent to your email!");
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.error ||
        err?.message ||
        "Failed to resend OTP.";
      toast.error(msg);
    }
  };

  return (
    <div className="flex items-center justify-between">
      {/* Left background image */}
      <div className="sm:w-1/2 hidden md:block relative">
        <div className="absolute top-6 left-40 z-40 rounded-[12px] bg-white flex w-[191px] h-[63px] px-[4.07px] pt-[7px] pb-[6px] justify-center items-center flex-shrink-0">
          <Logo />
        </div>
        <Image
          src={regBg}
          objectFit="cover"
          alt="Registration Background"
          className="w-full h-[100vh] object-cover"
        />
      </div>

      {/* Right OTP form */}
      <div className="sm:w-1/2 w-full flex items-center justify-center h-[100vh] mx-3">
        <div className="rounded-[8px] bg-white flex w-full md:w-[588px] md:p-[48px] flex-col justify-center items-center shadow-md max-w-md p-8">
          <Logo />
          <p className="text-black text-center font-nun text-xl sm:text-2xl lg:text-[32px] font-bold leading-[124%] py-6">
            Enter the OTP
          </p>

          <Form
            layout="vertical"
            className="w-full flex flex-col space-y-4 justify-center items-center"
            onFinish={handleSubmit(onSubmit)}
          >
            <Form.Item
              validateStatus={errors.otp ? "error" : ""}
              help={errors.otp?.message}
            >
              <Input.OTP
                length={6}
                value={watch("otp")}
                onChange={(value) => setValue("otp", value)}
                className="text-center text-lg tracking-widest"
              />
            </Form.Item>

            <div className="flex items-center justify-between w-full mb-4">
              <p className="text-[#686868] font-normal sm:text-sm text-xs lg:text-base font-nun leading-normal">
                Remember your password?{" "}
                <span className="text-[#007BFF] font-normal sm:text-sm text-xs lg:text-base font-nun leading-normal">
                  <Link href="/auth/login">Log in</Link>
                </span>
              </p>

              <Button
                type="link"
                onClick={handleSendOtp}
                loading={isResending}
                disabled={isResending}
                className="text-gray-500 hover:text-blue-500 p-0"
              >
                Resend OTP
              </Button>
            </div>

            <Form.Item className="w-full">
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={isLoading}
                className={cn({ "opacity-50 cursor-not-allowed": isLoading })}
              >
                Verify OTP
              </Button>
            </Form.Item>

            {isError && (
              <p className="text-red-500 text-sm mt-2 text-center">
                {errors.otp?.message ||
                  "Failed to verify OTP. Please try again."}
              </p>
            )}

            {isSuccess && (
              <p className="text-green-500 text-sm mt-2 text-center">
                OTP verified successfully! Redirecting...
              </p>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
