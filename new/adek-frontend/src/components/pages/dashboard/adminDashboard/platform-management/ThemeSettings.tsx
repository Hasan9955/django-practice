/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useGetPlatformDataQuery } from "@/redux/features/dashborad/platform/platformManagementApi";
import { toast } from "sonner";
import LogoSettings from "./cmsSetting/theme/LogoSettings";
import CategorySettings from "./cmsSetting/theme/CategorySettings";
import SubcategorySettings from "./cmsSetting/theme/SubcategorySettings";
import BannerSettings from "./cmsSetting/theme/BannerSettings";

interface CategoryItem {
  id: string;
  name: string;
  displayName: string;
  categoryPhoto: string;
  isDeleted: boolean;
  platformId: string;
  parentId: string | null;
  ancestors: string[];
  createdAt: string;
  updatedAt: string;
  file: File | null;
  preview: string;
}
interface BannerItem {
  id: string;
  title: string;
  description: string;
  file: File | null;
  preview: string;
  redirectUrl: string;
  bannerUrl: string;
}

const  ThemeSettings = () => {
  const { data: platform, isLoading: PlatformLoading } =
    useGetPlatformDataQuery({});

  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [logoPreview, setLogoPreview] = useState<string>("/placeholder.svg");

  useEffect(() => {
    if (!PlatformLoading && platform?.result) {
      setLogoPreview(platform.result.logo || "/placeholder.svg");
      setBanners(
        platform.result.banner?.map((b: any) => ({
          id: b.id,
          title: b.title || "",
          description: b.description || "",
          file: null,
          preview: b.bannerUrl || "/placeholder.svg",
          redirectUrl: b.redirectUrl || "",
          bannerUrl: b.bannerUrl || "/placeholder.svg",
        })) || [],
      );
      setCategories(
        platform.result.category
          ?.filter((c: any) => !c.ancestors?.length)
          .map((c: any) => ({
            id: c.id,
            name: c.name || "",
            displayName: c.displayName || "",
            categoryPhoto: c.categoryPhoto || "/placeholder.svg",
            isDeleted: c.isDeleted || false,
            platformId: c.platformId || "",
            parentId: c.parentId || null,
            ancestors: c.ancestors || [],
            createdAt: c.createdAt || "",
            updatedAt: c.updatedAt || "",
            file: null,
            preview: c.categoryPhoto || "/placeholder.svg",
          })) || [],
      );
    }
  }, [PlatformLoading, platform]);

  const validateFile = (file: File | null) => {
    if (!file) return true;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return false;
    }
    return true;
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg">
      <h1 className="text-4xl font-medium mb-6">Theme Settings</h1>
      <LogoSettings
        preview={logoPreview}
        setPreview={setLogoPreview}
        validateFile={validateFile}
      />
      <CategorySettings data={categories} setData={setCategories} />
      <SubcategorySettings />
      <BannerSettings
        data={banners}
        setData={setBanners}
        validateFile={validateFile}
      />
    </div>
  );
};

export default ThemeSettings;
