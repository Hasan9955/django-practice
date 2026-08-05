/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import regBg from "@/assets/images/auth/auth-header.png";
import Logo from "@/components/ui/Logo/Logo";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRegisterMutation } from "@/redux/features/auth/authApi";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSignupEmail, setUser } from "@/redux/features/auth/authSlice";
import Swal from "sweetalert2";
import { colors } from "@/lib/colors";
import toast from "react-hot-toast";

// Ant Design Imports
import { Form, Input, Radio, Checkbox, Button } from "antd";
import {
  CountrySelect,
  validatePhoneNumber,
} from "@/components/cuntryCode/Countryselect";

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const formSchema = z
  .object({
    role: z.enum(["BUYER", "SELLER", "ALL"], {
      required_error: "Please select a role",
    }),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    companyName: z.string().optional(),
    countryCode: z.string().min(1, "Please select a country code"),
    phoneNumber: z
      .string()
      .min(4, "Phone number is required")
      .regex(/^\d+$/, "Phone number must contain digits only"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  })
  .superRefine((data, ctx) => {
    const isValid = validatePhoneNumber(data.phoneNumber, data.countryCode);
    if (!isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid phone number for the selected country",
        path: ["phoneNumber"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

// ─── Component ────────────────────────────────────────────────────────────────
const RegisterComponent = () => {
  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "BUYER",
      countryCode: "+44",
    },
  });

  const router = useRouter();
  const dispatch = useDispatch();
  const [reg] = useRegisterMutation();

  const selectedCountryCode = watch("countryCode");

  const onSubmit = async (data: FormValues) => {
    const { firstName, lastName, countryCode, phoneNumber, ...rest } = data;
    const fullName = `${firstName} ${lastName}`;
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    try {
      const res = await reg({
        fullName,
        phoneNumber: fullPhoneNumber,
        ...rest,
      }).unwrap();

      const token = res?.result?.token;

      // ✅ FIX: Only dispatch if token exists, and only pass access_token
      // Passing { access_token: token } safely — setUser now does partial updates
      // so user and refresh_token are NOT wiped
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Signup Failed",
          text: "Please try again.",
          confirmButtonColor: colors.primary,
          confirmButtonText: "Okay",
        });
        return;
      }

      // ✅ FIX: Set token only (not a bare string, not an object missing other fields)
      dispatch(setUser({ access_token: token }));

      dispatch(setSignupEmail(data?.email));

      toast.success(res?.message || "Signup successful!");

      setTimeout(() => {
        router.replace("/auth/verify-otp?reason=SIGNUP_OTP_SECRET");
      }, 1500);
    } catch (err) {
      console.error(err);

      // ✅ FIX: Narrow error type properly before accessing properties
      if (typeof err === "object" && err !== null && "data" in err) {
        const e = err as any;
        const msg =
          e?.data?.message ?? e?.message ?? "An unexpected error occurred.";
        setError("email", { type: "manual", message: msg });
      } else if (typeof err === "string") {
        setError("email", { type: "manual", message: err });
      } else {
        setError("email", {
          type: "manual",
          message: "An unexpected error occurred.",
        });
      }
    }
  };

  return (
    <div className="relative w-full h-full xl:min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 z-0 grid md:grid-cols-2 grid-cols-1">
        <div
          className="hidden md:block w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${regBg.src})` }}
        />
        <div className="bg-white h-full" />
      </div>

      {/* Logo */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 md:translate-x-0 md:top-6 md:left-6 lg:top-10 lg:left-14 py-2 md:py-3 px-3 md:px-4 bg-white rounded-xl shadow-md z-10">
        <Logo className="w-[120px] sm:w-[150px] md:w-[183px] h-auto" />
      </div>

      {/* Main content */}
      <div className="container mx-auto relative z-10 px-4 py-10">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-8 lg:gap-10">
          {/* Hero */}
          <div className="w-full hidden sm:block md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <h3 className="text-[26px] sm:text-[32px] md:text-[40px] lg:text-[56px] xl:text-[68px] font-bold leading-tight text-white mt-6">
              Find the Hidden Gems Before the World Does
            </h3>
            <p className="text-base sm:text-lg md:text-xl mt-3 md:mt-6 font-medium text-white">
              Curated, Trend-Driven Products. Built for Bold Micro-Niche Brands
            </p>
          </div>

          {/* Registration Form */}
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md mx-auto mt-8 sm:mt-0 md:mx-0">
            <h1 className="text-xl sm:text-[32px] md:text-[36px] font-bold mb-1">
              Create New Account
            </h1>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Please enter details
            </p>

            {/* ✅ FIX: Use onFinish only — do NOT use both action and onFinish */}
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
              {/* Role */}
              <Form.Item
                label="Select your role"
                validateStatus={errors.role ? "error" : ""}
                help={errors.role?.message}
              >
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group {...field}>
                      <Radio value="BUYER">Buyer</Radio>
                      <Radio value="SELLER">Seller</Radio>
                    </Radio.Group>
                  )}
                />
              </Form.Item>

              {/* First Name */}
              <Form.Item
                label="First Name"
                validateStatus={errors.firstName ? "error" : ""}
                help={errors.firstName?.message}
              >
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter first name" />
                  )}
                />
              </Form.Item>

              {/* Last Name */}
              <Form.Item
                label="Last Name"
                validateStatus={errors.lastName ? "error" : ""}
                help={errors.lastName?.message}
              >
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter last name" />
                  )}
                />
              </Form.Item>

              {/* Company */}
              <Form.Item label="Company Name (optional)">
                <Controller
                  name="companyName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter your company name" />
                  )}
                />
              </Form.Item>

              {/* Phone Number */}
              <Form.Item
                label="Phone number"
                validateStatus={errors.phoneNumber ? "error" : ""}
                help={errors.phoneNumber?.message}
              >
                <div className="flex gap-2 flex-col lg:flex-row items-start">
                  {/* Country code picker */}
                  <Controller
                    name="countryCode"
                    control={control}
                    render={({ field }) => (
                      <CountrySelect
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  {/* Local number input */}
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                      <div className="flex-1 w-full">
                        <Input
                          {...field}
                          placeholder="Enter your number"
                          addonBefore={
                            <span className="text-gray-500 text-sm select-none">
                              {selectedCountryCode}
                            </span>
                          }
                          onChange={(e) => {
                            // ✅ Strip non-digits on input
                            const digits = e.target.value.replace(/\D/g, "");
                            field.onChange(digits);
                          }}
                        />
                      </div>
                    )}
                  />
                </div>
              </Form.Item>

              {/* Email */}
              <Form.Item
                label="Email"
                validateStatus={errors.email ? "error" : ""}
                help={errors.email?.message}
              >
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter your email" />
                  )}
                />
              </Form.Item>

              {/* Password */}
              <Form.Item
                label="Password"
                validateStatus={errors.password ? "error" : ""}
                help={errors.password?.message}
              >
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      placeholder="Enter your password"
                    />
                  )}
                />
              </Form.Item>

              {/* Terms */}
              <Form.Item
                validateStatus={errors.termsAccepted ? "error" : ""}
                help={errors.termsAccepted?.message}
              >
                <Controller
                  name="termsAccepted"
                  control={control}
                  render={({ field }) => (
                    // ✅ FIX: Checkbox needs checked={field.value} and onChange via field
                    // value prop on Checkbox causes issues — use checked instead
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    >
                      I agree to the{" "}
                      <Link href="/policies" className="text-blue-600">
                        Terms &amp; Conditions
                      </Link>
                    </Checkbox>
                  )}
                />
              </Form.Item>

              {/* Submit */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Signup
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center mt-4 text-sm sm:text-base">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-blue-600 font-medium hover:underline"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterComponent;
