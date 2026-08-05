/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { setUser } from "@/redux/features/auth/authSlice";
import Logo from "@/components/ui/Logo/Logo";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
  PlaystoreIcon,
  ApllestoreIcon,
  VisaCardIcon,
  MasterCardIcon,
  StripeIcon,
} from "@/assets/svgIcon";
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import header from "@/assets/images/auth/auth-header.png";
import { Form, Input, Button, Checkbox } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import Image from "next/image";

const LoginForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [login, { isLoading }] = useLoginMutation();

  // ✅ Restore saved email and remember me state on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    const savedRemember = localStorage.getItem("remember_me") === "true";

    if (savedEmail && savedRemember) {
      form.setFieldsValue({
        email: savedEmail,
        remember: true,
      });
    }
  }, [form]);

  const onFinish = async (values: any) => {
    try {
      const { email, password, remember } = values;

      // ✅ Save or clear remembered email based on checkbox
      if (remember) {
        localStorage.setItem("remembered_email", email);
        localStorage.setItem("remember_me", "true");
      } else {
        localStorage.removeItem("remembered_email");
        localStorage.removeItem("remember_me");
      }

      const res = await login({ email, password }).unwrap();

      if (!res?.success) {
        toast.error(res?.message || "Login failed.");
        return;
      }

      toast.success("Login successful!");
      const user = res?.result;

      dispatch(
        setUser({
          user: user.userInfo,
          access_token: user.accessToken,
        })
      );

      // ✅ Save access token if remember me is checked
      if (remember) {
        localStorage.setItem("access_token", user.accessToken);
      } else {
        localStorage.removeItem("access_token");
      }

      if (
        user?.userInfo?.role === "ADMIN" ||
        user?.userInfo?.role === "SELLER"
      ) {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div
        className="relative w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${header.src})` }}
      >
        <div className="container mx-auto flex flex-col min-h-screen">
          <div className="mt-6 sm:mt-10 mb-4 bg-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg w-max mx-auto sm:mx-0">
            <Logo />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 xl:gap-12 flex-1 items-center">
            {/* Hero Text */}
            <div className="text-center lg:text-left px-4 lg:px-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-lg">
                Find the Hidden Gems Before the World Does
              </h1>
              <p className="mt-3 text-base sm:text-lg md:text-xl text-white drop-shadow-lg max-w-lg mx-auto lg:mx-0">
                Curated, Trend-Driven Products. Built for Bold Micro-Niche
                Brands
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white mb-8 rounded-xl w-full sm:max-w-lg mx-auto p-6 md:p-8 shadow-lg">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-text-black text-center">
                Log in here
              </h2>

              {/* ✅ form instance bound here */}
              <Form
                form={form}
                name="loginForm"
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ remember: true }}
              >
                {/* Email */}
                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Enter a valid email!" },
                  ]}
                >
                  <Input placeholder="test@example.com" />
                </Form.Item>

                {/* Password */}
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please input your password!" },
                  ]}
                >
                  <Input.Password
                    placeholder="Password"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>

                {/* Remember Me & Forgot Password */}
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-4">
                  <Form.Item
                    name="remember"
                    valuePropName="checked"
                    className="mb-0"
                  >
                    <Checkbox>Remember Me</Checkbox>
                  </Form.Item>
                  <Link href="/forgot-password" className="text-orange-500">
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={isLoading}
                  >
                    Login
                  </Button>
                </Form.Item>
              </Form>

              {/* Sign Up Link */}
              <div className="mt-4 text-center text-sm sm:text-base text-gray-700">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-blue-600 font-semibold"
                >
                  Sign Up
                </Link>
              </div>

              {/* Divider */}
              <div className="border-t my-6"></div>

              {/* Social Login */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <p className="text-gray-700 font-semibold text-base sm:text-lg">
                  Log in with:
                </p>
                <div className="flex gap-3">
                  <Button
                    icon={<FaGoogle />}
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                  />
                  <Button
                    icon={<FaFacebook />}
                    type="primary"
                    style={{
                      backgroundColor: "#3b5998",
                      borderColor: "#3b5998",
                    }}
                    onClick={() => signIn("facebook", { callbackUrl: "/" })}
                  />
                  <Button
                    icon={<FaApple />}
                    style={{
                      backgroundColor: "black",
                      borderColor: "black",
                      color: "white",
                    }}
                    onClick={() => signIn("apple")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black pt-6 sm:pt-10 lg:pt-12 xl:pt-16 pb-12">
        <div className="container mx-auto flex flex-col gap-8">
          {/* Payment Icons */}
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 sm:gap-4 md:gap-6">
            <div className="bg-white rounded-xl w-[90px] sm:w-[100px] md:w-[114px] h-[40px] sm:h-[45px] md:h-[47px] flex justify-center items-center">
              <VisaCardIcon />
            </div>
            <div className="bg-white rounded-xl w-[90px] sm:w-[100px] md:w-[114px] h-[40px] sm:h-[45px] md:h-[47px] flex justify-center items-center">
              <MasterCardIcon />
            </div>
            <div className="bg-white rounded-xl w-[90px] sm:w-[100px] md:w-[114px] h-[40px] sm:h-[45px] md:h-[47px] flex justify-center items-center">
              <StripeIcon />
            </div>
            <div className="bg-white rounded-xl w-[90px] px-2 sm:w-[100px] md:w-[114px] h-[40px] sm:h-[45px] md:h-[47px] flex justify-center items-center">
              <Image
                src="/paystack.svg"
                alt="Paystack"
                width={150}
                height={150}
              />
            </div>
          </div>

          {/* Social + App Download */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Social Section */}
            <div>
              <p className="text-white font-nun text-lg sm:text-xl font-medium mb-4">
                Follow us on
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <FacebookIcon />
                  <p className="text-white text-sm sm:text-base">Facebook</p>
                </div>
                <div className="flex items-center gap-2">
                  <InstagramIcon />
                  <p className="text-white text-sm sm:text-base">Instagram</p>
                </div>
                <div className="flex items-center gap-2">
                  <LinkedInIcon />
                  <p className="text-white text-sm sm:text-base">LinkedIn</p>
                </div>
                <div className="flex items-center gap-2">
                  <TwitterIcon />
                  <p className="text-white text-sm sm:text-base">Twitter</p>
                </div>
              </div>
            </div>

            {/* App Download Section */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-4 items-center sm:items-start">
              <div className="flex gap-2 justify-start text-start bg-gray-900 py-2 px-3 rounded-xl w-max flex-1 sm:flex-none">
                <PlaystoreIcon />
                <div className="-mt-1 text-white">
                  <p className="text-sm sm:text-base font-medium">
                    Get the app
                  </p>
                  <h5 className="text-sm sm:text-base font-semibold">
                    Google Playstore
                  </h5>
                </div>
              </div>
              <div className="flex gap-2 justify-start text-start bg-gray-900 py-2 px-3 rounded-xl w-max flex-1 sm:flex-none">
                <ApllestoreIcon />
                <div className="text-white">
                  <p className="text-sm sm:text-base font-medium">
                    Download the app
                  </p>
                  <h5 className="text-sm sm:text-base font-semibold">
                    App Store
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;