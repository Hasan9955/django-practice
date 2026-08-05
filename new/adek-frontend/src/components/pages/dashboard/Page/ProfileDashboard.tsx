/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import type React from "react";
import Image from "next/image";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Typography,
  Skeleton,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/redux/features/dashborad/sellerProfile/sellerProfileApi";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CountrySelect,
  validatePhoneNumber,
} from "@/components/cuntryCode/Countryselect";

const { TextArea } = Input;
const { Title, Text } = Typography;

// Define form data type for clarity
interface ProfileFormData {
  name: string;
  shopName: string;
  desc: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  country: string;
  city: string;
  address: string;
  zipcode: string;
}

// Zod validation schema
const storeSetupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    shopName: z
      .string()
      .min(3, "Shop name must be at least 3 characters")
      .max(100, "Shop name must be less than 100 characters"),
    desc: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must be less than 500 characters"),
    countryCode: z.string().min(1, "Country code is required"),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must be less than 15 digits")
      .regex(/^\d+$/, "Phone number can only contain digits"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Email address is required"),
    country: z.string().min(2, "Country is required"),
    city: z.string().min(2, "City is required"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    zipcode: z.string().min(2, "Zipcode is required"),
  })
  .refine((data) => validatePhoneNumber(data.phoneNumber, data.countryCode), {
    message: "Invalid phone number for the selected country",
    path: ["phoneNumber"],
  });

function parsePhoneNumber(fullPhone: string): {
  selectedCode: string;
  number: string;
} {
  const match = fullPhone.match(/^(\+\d{1,3})(\d+)$/);
  if (match) {
    return { selectedCode: match[1], number: match[2] };
  }
  return { selectedCode: "+44", number: fullPhone.replace(/^\+?\d{1,3}/, "") };
}

export default function ProfileDashboard() {
  const { data, isLoading } = useGetProfileQuery({});
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const { data: store } = useGetProfileQuery({});
  const user = useSelector((state: RootState) => state.auth.user);
  const email = user?.email || "";

  const storeId = store?.result?.id;

  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [shopLogo, setShopLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const profiledata = data?.result;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(storeSetupSchema),
    defaultValues: {
      name: profiledata?.name || "",
      shopName: profiledata?.shopName || "",
      desc: profiledata?.desc || "",
      countryCode: "+44",
      phoneNumber: "",
      email: profiledata?.email || email || "",
      country: profiledata?.country || "",
      city: profiledata?.city || "",
      address: profiledata?.address || "",
      zipcode: profiledata?.zipcode || "",
    },
  });

  const selectedCountryCode = watch("countryCode") || "+234";

  useEffect(() => {
    if (profiledata) {
      const fullPhone = profiledata.phoneNumber || "";
      const { selectedCode, number } = parsePhoneNumber(fullPhone);

      reset({
        name: profiledata.name || "Your Name",
        shopName: profiledata.shopName || "Your Shop Name",
        desc: profiledata.desc || "Your store description goes here...",
        countryCode: selectedCode,
        phoneNumber: number,
        email: profiledata.email || email || "example@email.com",
        country: profiledata.country || "",
        city: profiledata.city || "",
        address: profiledata.address || "",
        zipcode: profiledata.zipcode || "",
      });

      if (profiledata.bannerImage) setBannerPreview(profiledata.bannerImage);
      if (profiledata.shopLogo) setLogoPreview(profiledata.shopLogo);
    }
  }, [profiledata, reset, email]);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;
    if (!allowedTypes.includes(file.type))
      return "Please upload a valid image file (JPEG, PNG, or WebP)";
    if (file.size > maxSize) return "File size must be less than 5MB";
    return null;
  };

  const handleBannerChange = (info: any) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      const error = validateFile(file);
      if (error) {
        message.error(error);
        return;
      }
      setBannerImage(file);
      const previewUrl = URL.createObjectURL(file);
      if (bannerPreview && bannerPreview.startsWith("blob:"))
        URL.revokeObjectURL(bannerPreview);
      setBannerPreview(previewUrl);
    }
  };

  const handleLogoChange = (info: any) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      const error = validateFile(file);
      if (error) {
        message.error(error);
        return;
      }
      setShopLogo(file);
      const previewUrl = URL.createObjectURL(file);
      if (logoPreview && logoPreview.startsWith("blob:"))
        URL.revokeObjectURL(logoPreview);
      setLogoPreview(previewUrl);
    }
  };

  const handleBannerRemove = () => {
    if (bannerPreview && bannerPreview.startsWith("blob:"))
      URL.revokeObjectURL(bannerPreview);
    setBannerImage(null);
    setBannerPreview(null);
  };

  const handleLogoRemove = () => {
    if (logoPreview && logoPreview.startsWith("blob:"))
      URL.revokeObjectURL(logoPreview);
    setShopLogo(null);
    setLogoPreview(null);
  };

  const onFinish: SubmitHandler<ProfileFormData> = async (values) => {
    const bodyData = {
      name: values.name,
      shopName: values.shopName,
      desc: values.desc,
      phoneNumber: `${values.countryCode}${values.phoneNumber}`,
      email: values.email || email,
      storeId,
      country: values.country,
      city: values.city,
      address: values.address,
      zipcode: values.zipcode,
    };

    const formData = new FormData();
    formData.append("bodyData", JSON.stringify(bodyData));
    if (bannerImage) formData.append("bannerImage", bannerImage);
    if (shopLogo) formData.append("shopLogo", shopLogo);

    try {
      const result = await updateProfile(formData).unwrap();
      if (result?.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(result?.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error(error);
      message.error(error?.data?.message || "Update failed");
    }
  };

  const handleCancel = () => {
    handleBannerRemove();
    handleLogoRemove();

    if (profiledata) {
      const fullPhone = profiledata.phoneNumber || "";
      const { selectedCode, number } = parsePhoneNumber(fullPhone);

      reset({
        name: profiledata.name || "Your Name",
        shopName: profiledata.shopName || "Your Shop Name",
        desc: profiledata.desc || "Your store description goes here...",
        countryCode: selectedCode,
        phoneNumber: number,
        email: profiledata.email || email || "example@email.com",
        country: profiledata.country || "",
        city: profiledata.city || "",
        address: profiledata.address || "",
        zipcode: profiledata.zipcode || "",
      });

      if (profiledata.bannerImage) setBannerPreview(profiledata.bannerImage);
      if (profiledata.shopLogo) setLogoPreview(profiledata.shopLogo);
    }
  };

  const bannerUploadButton = (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors cursor-pointer">
      <div className="flex justify-center mb-2">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
          <PlusOutlined />
        </div>
      </div>
      <p className="text-sm text-gray-500">Click to upload banner image</p>
    </div>
  );

  // ── SKELETON LOADING STATE ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto p-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton active title={{ width: 150 }} paragraph={{ rows: 2 }} />
        </div>

        {/* Banner Upload Skeleton */}
        <div className="mb-8">
          <Skeleton.Input
            active
            block
            style={{ height: "192px", borderRadius: "8px" }}
          />
          <div className="flex items-center gap-4 mt-4">
            <Skeleton.Avatar active size={48} shape="circle" />
            <Skeleton.Button active />
          </div>
        </div>

        {/* Form Fields Skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton.Input active size="small" style={{ width: "100px" }} />
            <Skeleton.Input active block />
          </div>

          <div className="space-y-2">
            <Skeleton.Input active size="small" style={{ width: "100px" }} />
            <Skeleton.Input active block />
          </div>

          <div className="space-y-2">
            <Skeleton.Input active size="small" style={{ width: "100px" }} />
            <Skeleton.Input active block style={{ height: "100px" }} />
          </div>

          {/* Location Grids Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton.Input active size="small" style={{ width: "80px" }} />
              <Skeleton.Input active block />
            </div>
            <div className="space-y-2">
              <Skeleton.Input active size="small" style={{ width: "80px" }} />
              <Skeleton.Input active block />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton.Input active size="small" style={{ width: "80px" }} />
              <Skeleton.Input active block />
            </div>
            <div className="space-y-2">
              <Skeleton.Input active size="small" style={{ width: "80px" }} />
              <Skeleton.Input active block />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton.Input active size="small" style={{ width: "120px" }} />
            <Skeleton.Input active block />
          </div>

          <div className="space-y-2">
            <Skeleton.Input active size="small" style={{ width: "100px" }} />
            <Skeleton.Input active block />
          </div>

          {/* Shop Logo Skeleton */}
          <div className="space-y-2">
            <Skeleton.Input active size="small" style={{ width: "100px" }} />
            <div className="flex items-center gap-4">
              <Skeleton.Avatar active size={64} shape="circle" />
              <Skeleton.Button active />
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex gap-3 pt-4">
            <Skeleton.Button active size="large" style={{ width: "80px" }} />
            <Skeleton.Button active size="large" style={{ width: "80px" }} />
          </div>
        </div>
      </div>
    );
  }
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto p-6">
      <div className="mb-8">
        <Title level={2} className="!mb-2">
          My store
        </Title>
        <Text type="secondary">
          Welcome to Sellapy, your premier destination for everyday essentials.
          From the latest trends in Men’s Clothing & Sneakers to curated Beauty
          & Skincare and high-quality Food items, we bring quality and
          convenience directly to your door. Shop smarter, live better.
        </Text>
      </div>

      <form onSubmit={handleSubmit(onFinish)}>
        <div className="mb-8">
          <Title level={4} className="!mb-4">
            Upload shop Banner Image
          </Title>
          {!bannerPreview ? (
            <Upload
              name="bannerImage"
              listType="picture"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleBannerChange}
            >
              {bannerUploadButton}
            </Upload>
          ) : (
            <div className="border-2 border-gray-200 rounded-lg mb-4 overflow-hidden relative">
              <Image
                src={bannerPreview}
                width={800}
                height={200}
                alt="Banner preview"
                className="w-full h-48 object-cover"
              />
            </div>
          )}
          <Text type="secondary" className="block mb-4">
            Recommended 1200x400
          </Text>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {bannerPreview ? (
                <Image
                  src={bannerPreview}
                  width={48}
                  height={48}
                  alt="Banner thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UploadOutlined />
              )}
            </div>
            <div className="flex gap-2">
              <Upload
                name="bannerImage"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleBannerChange}
              >
                <Button>
                  {bannerPreview ? "Replace image" : "Upload image"}
                </Button>
              </Upload>
              {bannerPreview && (
                <Button onClick={handleBannerRemove}>Remove image</Button>
              )}
            </div>
          </div>
        </div>

        <Form.Item
          label="Your name"
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter your name" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Shop name"
          validateStatus={errors.shopName ? "error" : ""}
          help={errors.shopName?.message}
        >
          <Controller
            name="shopName"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter shop name" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          validateStatus={errors.desc ? "error" : ""}
          help={errors.desc?.message}
        >
          <Controller
            name="desc"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                placeholder="Enter store description"
                rows={4}
                showCount
                maxLength={500}
              />
            )}
          />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Country"
            validateStatus={errors.country ? "error" : ""}
            help={errors.country?.message}
          >
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="E.g., BD" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="City"
            validateStatus={errors.city ? "error" : ""}
            help={errors.city?.message}
          >
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="E.g., Dhaka" />
              )}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Address"
            validateStatus={errors.address ? "error" : ""}
            help={errors.address?.message}
          >
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="E.g., Banasree" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Zipcode"
            validateStatus={errors.zipcode ? "error" : ""}
            help={errors.zipcode?.message}
          >
            <Controller
              name="zipcode"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="E.g., 1200" />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Phone number"
          validateStatus={errors.phoneNumber ? "error" : ""}
          help={errors.phoneNumber?.message}
        >
          <div className="flex gap-2 flex-col lg:flex-row items-start">
            <Controller
              name="countryCode"
              control={control}
              render={({ field }) => (
                <CountrySelect value={field.value} onChange={field.onChange} />
              )}
            />

            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <div className="flex-1">
                  <Input
                    {...field}
                    placeholder="Enter your number"
                    addonBefore={
                      <span className="text-gray-500 text-sm select-none">
                        {selectedCountryCode}
                      </span>
                    }
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      field.onChange(digits);
                    }}
                  />
                </div>
              )}
            />
          </div>
        </Form.Item>

        <Form.Item
          label="Email Address"
          validateStatus={errors.email ? "error" : ""}
          help={errors.email?.message}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Email address" disabled={true} />
            )}
          />
        </Form.Item>

        <Form.Item label="Shop Logo">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors overflow-hidden">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  width={64}
                  height={64}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <PlusOutlined />
              )}
            </div>
            <div className="flex gap-2">
              <Upload
                name="shopLogo"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleLogoChange}
              >
                <Button>
                  {logoPreview ? "Replace logo" : "Click to replace"}
                </Button>
              </Upload>
              {logoPreview && (
                <Button danger onClick={handleLogoRemove}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        </Form.Item>

        <div className="flex gap-3">
          <Button
            type="primary"
            htmlType="submit"
            loading={isUpdating}
            size="large"
          >
            {isUpdating ? "Saving..." : "Save"}
          </Button>
          <Button onClick={handleCancel} disabled={isUpdating} size="large">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
