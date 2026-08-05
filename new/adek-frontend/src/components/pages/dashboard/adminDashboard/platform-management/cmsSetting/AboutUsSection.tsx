/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button/Button";
import { Input, Skeleton } from "antd";
import toast from "react-hot-toast";
import { FaCloudUploadAlt } from "react-icons/fa";
import {
  useUpdatePlatformMutation,
  useGetPlatformDataQuery,
} from "@/redux/features/dashborad/platform/platformManagementApi";
import TiptapEditor from "@/components/shared/TiptapEditor";

const AboutUsSection = () => {
  const [submitAboutUs, { isLoading: isAboutUsLoading }] =
    useUpdatePlatformMutation();
  const { data: platformData, isLoading: isPlatformDataLoading } =
    useGetPlatformDataQuery({});

  const banner = platformData?.result?.CmsSetting?.[0];

  const [aboutBannerFile, setAboutBannerFile] = useState<File | null>(null);
  const [aboutBannerPreview, setAboutBannerPreview] = useState<string>("");
  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutContent, setAboutContent] = useState(""); // ✅ only tracks user edits via onChange
  const [redirectUrl, setRedirectUrl] = useState("");

  // ✅ Sync everything except aboutContent (TiptapEditor handles its own initial value)
  useEffect(() => {
    if (banner) {
      setAboutTitle(banner.title || "");
      setAboutBannerPreview(banner.bannerImage || "");
      setRedirectUrl(banner.redirectUrl || "");
    }
  }, [banner]);

  const handleAboutBannerChange = (file: File) => {
    setAboutBannerFile(file);
    const preview = URL.createObjectURL(file);
    setAboutBannerPreview(preview);
  };

  const handleSubmitAboutUs = async () => {
    try {
      const formData = new FormData();
      formData.append("cmsSettingTitle", aboutTitle);
      formData.append("aboutUs", aboutContent);
      formData.append("redirectUrl", redirectUrl);

      if (aboutBannerFile) {
        formData.append("crmBanner", aboutBannerFile);
      }

      const response = await submitAboutUs(formData).unwrap();

      if (response.success) {
        toast.success("About Us section updated successfully!");
        setAboutBannerFile(null);
      } else {
        toast.error(response.message || "Failed to update About Us section");
      }
    } catch (error: any) {
      console.error("About Us submission error:", error);
      toast.error(error?.data?.message || "Failed to update About Us section");
    }
  };

  return (
    <div>
      <div>
        <h2 className="text-color-1c font-inter text-[24px] font-medium leading-normal mb-3">
          About us
        </h2>
        <p className="text-[#5F6368] font-inter text-base font-normal">
          Add your preferred content and banner image
        </p>
      </div>

      <div className="rounded-[16px] mt-10 bg-[#F2F2F2] flex w-full px-4 py-6 items-center gap-2.5">
        {isPlatformDataLoading ? (
          <Skeleton active />
        ) : (
          <div className="w-full flex flex-col justify-start items-start">
            {/* Banner Image */}
            <div className="w-full flex flex-col justify-start items-start">
              <label className="text-color-1c font-nunito text-lg font-semibold">
                Banner image
              </label>
              <div className="rounded-[18px] bg-white mt-4 w-[301px] h-[182px]">
                {aboutBannerPreview ? (
                  <Image
                    src={aboutBannerPreview}
                    alt="Banner preview"
                    width={300}
                    height={182}
                    className="object-cover w-[301px] h-[182px] rounded"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <div className="mt-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAboutBannerChange(file);
                  }}
                  id="about-banner"
                  className="hidden"
                />
                <label
                  htmlFor="about-banner"
                  className="cursor-pointer flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <FaCloudUploadAlt />
                  Change banner
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="mt-6 w-full flex flex-col justify-start items-start">
              <label className="text-color-1c font-nunito text-lg font-semibold">
                Title
              </label>
              <Input
                placeholder="Enter title"
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
                className="w-full custom-input-container mt-4 custom-input"
              />
            </div>

            {/* Redirect URL */}
            <div className="mt-6 w-full flex flex-col justify-start items-start">
              <label className="text-color-1c font-nunito text-lg font-semibold">
                Redirect URL
              </label>
              <Input
                placeholder="Enter redirect URL (e.g. https://example.com/about)"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                className="w-full custom-input-container mt-4 custom-input"
              />
            </div>

            {/* About Us Content */}
            <div className="mt-6 mb-8 w-full flex flex-col justify-start items-start">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About us content
              </label>
              <div className="w-full border-gray-300 rounded-md overflow-hidden">
                <TiptapEditor
                  key={banner?.aboutUs || "empty"}
                  content={banner?.aboutUs || ""}
                  onChange={setAboutContent}
                  placeholder="Enter about us content..."
                />
              </div>
            </div>

            <Button
              onClick={handleSubmitAboutUs}
              className="bg-blue-600 rounded-full text-white hover:bg-blue-700"
              disabled={isAboutUsLoading}
            >
              {isAboutUsLoading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutUsSection;