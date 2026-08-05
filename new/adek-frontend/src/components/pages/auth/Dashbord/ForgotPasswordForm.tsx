/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Form, Input, Button, Typography } from "antd";
import Logo from "@/components/ui/Logo/Logo";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "@/redux/features/auth/authApi";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/features/auth/authSlice";

const { Title } = Typography;

export default function ForgotPasswordForm() {
  const [forgotPassword] = useForgotPasswordMutation();
  const [sendOtp] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [resetPassword] = useResetPasswordMutation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Step 1: Send OTP
  const handleEmailSubmit = async (values: { email: string }) => {
    try {
      setEmail(values.email);
      const res = await forgotPassword({ email: values.email }).unwrap();
      if (res?.result?.token) {
        dispatch(setUser({ access_token: res.result.token }));
        setIsOtpSent(true);
        toast.success("OTP sent to your email!");
      } else {
        toast.error("Failed to send OTP.");
      }
    } catch (error: any) {
      const msg =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        "Failed to send OTP.";
      toast.error(msg);
    }
  };

  // Step 1b: Resend OTP
  const handleSendOtp = async () => {
    try {
      const res = await sendOtp({
        email,
        reason: "FORGET_PASSWORD_SECRET",
      }).unwrap();
      if (res?.result?.token) {
        dispatch(setUser({ access_token: res.result.token }));
        toast.success("OTP resent to your email!");
      }
    } catch (error: any) {
      const msg =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        "Failed to resend OTP.";
      toast.error(msg);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (values: { otp: string }) => {
    try {
      const res = await verifyOtp({
        otp: values.otp,
        reason: "FORGET_PASSWORD_SECRET",
      }).unwrap();
      if (res?.result?.token) {
        dispatch(setUser({ access_token: res.result.token }));
        setIsOtpVerified(true);
        toast.success("OTP verified! You can now set a new password.");
      } else {
        toast.error(res?.message || "Failed to verify OTP.");
      }
    } catch (error: any) {
      const msg =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        "Failed to verify OTP.";
      toast.error(msg);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (values: { newPassword: string }) => {
    try {
      const res = await resetPassword({
        newPassword: values.newPassword,
        reason: "RESET_PASSWORD_SECRET",
      }).unwrap();

      if (res?.result) {
        toast.success("Password successfully reset!");
        window.location.href = "/auth/login";
      } else {
        toast.error(res?.message || "Failed to reset password.");
      }
    } catch (error: any) {
      const msg =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        "Failed to reset password.";
      toast.error(msg);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F6F6F6] px-4">
      <div className="w-full max-w-md sm:max-w-lg p-6 sm:p-12 rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        {!isOtpSent && (
          <>
            <Title level={3} className="text-center mb-8">
              Forgot your password?
            </Title>
            <Form
              name="sendOtpForm"
              layout="vertical"
              onFinish={handleEmailSubmit}
              requiredMark={false}
              className="space-y-4"
            >
              <Form.Item
                label="Email address"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  placeholder="Email address"
                  size="large"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Item>
              <div className="text-end text-sm text-gray-500 mb-2">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-500 hover:underline"
                >
                  Log in
                </Link>
              </div>
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  Send OTP
                </Button>
              </Form.Item>
            </Form>
          </>
        )}

        {isOtpSent && !isOtpVerified && (
          <div className="flex flex-col items-center justify-center">
            <Title level={3} className="text-center mb-8">
              Enter OTP
            </Title>
            <Form
              name="verifyOtpForm"
              layout="vertical"
              onFinish={handleVerifyOtp}
              requiredMark={false}
              className="space-y-4"
            >
              <Form.Item
                name="otp"
                rules={[{ required: true, message: "Please enter the OTP!" }]}
              >
                <Input.OTP
                  length={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  className="text-center text-lg tracking-widest"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  Verify OTP
                </Button>
              </Form.Item>
            </Form>

            <Button
              type="link"
              onClick={handleSendOtp}
              className="mt-2 text-gray-500 hover:text-blue-500"
            >
              Resend OTP
            </Button>
          </div>
        )}

        {isOtpVerified && (
          <div className="flex flex-col items-center justify-center">
            <Title level={3} className="text-center mb-8">
              Set New Password
            </Title>
            <Form
              name="resetPasswordForm"
              layout="vertical"
              onFinish={handleResetPassword}
              requiredMark={false}
              className="space-y-4"
            >
              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                  { required: true, message: "Please enter a new password!" },
                ]}
              >
                <Input.Password
                  placeholder="New Password"
                  size="large"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
