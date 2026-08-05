"use client";
import React, { useState } from "react";
import Image from "next/image";
import { BsShopWindow } from "react-icons/bs";
import { MdOutlineTimer } from "react-icons/md";
import { CiDiscount1 } from "react-icons/ci";
import { Button } from "@/components/ui/Button/Button";
import imagebanner from "@/assets/images/store/storebanner.png";
import { useUserStoreQuery } from "@/redux/features/storeapi/storeApi";
import { usePathname } from "next/navigation";
import {
  useCreateFollowMutation,
  useGetStoreFollowersQuery,
} from "@/redux/features/niche_hub/nicheHubApi";
import { Skeleton } from "antd";
import StoreCouponsModal from "@/components/ui/Modal/Modal";
import SellerActionPanel from "./SellerActionPanel";

// ─── Shared image optimisation constants ─────────────────────────────────────
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+";

const FALLBACK_AVATAR = "/images.png";
const FALLBACK_BANNER = imagebanner as unknown as string;

// ─── Type Definitions ────────────────────────────────────────────────────────
interface StoreData {
  id: string;
  bannerImage: string;
  name: string;
  desc: string;
  shopName: string;
  shopLogo: string;
  createdAt: string;
  followers: number;
  followings: number;
  isFollowedByMe: boolean;
  totalItemSold: number;
  totalRevenue: number;
  totalOrders: number;
  seller?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

interface SellerInfo {
  name: string;
  profileImage: string;
  bannerImage: string;
  description: string;
  yearsOnPlatform: number;
  followers: number;
  following: number;
  itemsSold: number;
  createdAt: string;
}

function handleImgError(
  e: React.SyntheticEvent<HTMLImageElement>,
  fallback: string,
) {
  const img = e.currentTarget;
  if (!img.dataset.fallback) {
    img.src = fallback;
    img.dataset.fallback = "true";
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export default function SellerProfile() {
  const path = usePathname();
  const storeId = path?.split("/")[2];

  // Validate storeId exists

  const { data, isLoading, isError } = useUserStoreQuery(storeId);
  const [open, setOpen] = useState<boolean>(false);
  const [sendFollow, { isLoading: isFollowLoading }] =
    useCreateFollowMutation();
  const { data: followersData, isLoading: isFollowersLoading } =
    useGetStoreFollowersQuery(storeId);

  const showLoading = () => {
    setOpen(true);
    setTimeout(() => setOpen(false), 2000);
  };
  if (!storeId) {
    return <p className="p-4 text-red-500">Error: Invalid store ID</p>;
  }

  if (isLoading) return <Skeleton active />;
  if (isError || !data?.result) {
    return <p className="p-4 text-red-500">Error loading store.</p>;
  }

  const storeResult = data.result as StoreData;

  // Calculate years on platform safely
  const yearsOnPlatform = storeResult.createdAt
    ? new Date().getFullYear() - new Date(storeResult.createdAt).getFullYear()
    : 0;

  const seller: SellerInfo = {
    name: storeResult.shopName || "Unknown Store",
    profileImage: storeResult.shopLogo || FALLBACK_AVATAR,
    bannerImage: storeResult.bannerImage || FALLBACK_BANNER,
    description: storeResult.desc || "No description provided.",
    yearsOnPlatform: yearsOnPlatform,
    followers: storeResult.followers || 0,
    following: storeResult.followings || 0,
    itemsSold: storeResult.totalItemSold || 0,
    createdAt: storeResult.createdAt,
  };

  const handleFollow = async () => {
    try {
      const res = await sendFollow({ storeId }).unwrap();
      console.log("Follow Success:", res);
    } catch (error) {
      console.error("Follow Error:", error);
    }
  };

  return (
    <>
      <div className="relative bg-[#F6F6F6] w-full">
        {/* ── Banner ──────────────────────────────────────────────────────── */}
        <div className="relative w-full h-[220px] sm:h-[260px] md:h-[320px] lg:h-[380px] xl:h-[420px]">
          <Image
            src={seller.bannerImage}
            alt="Store Banner"
            fill
            sizes="100vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            priority
            onError={(e) => handleImgError(e, FALLBACK_BANNER)}
          />
        </div>

        {/* ── Profile Section ─────────────────────────────────────────────── */}
        <div className="relative -mt-16 sm:-mt-20 md:-mt-24 lg:-mt-28 xl:-mt-32 px-4 sm:px-6 md:px-8 container lg:px-10 xl:px-0">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-[18px] text-white shadow-lg">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-4 sm:p-6 md:p-8 lg:p-10">
              {/* Left Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:w-3/4">
                {/* ── Avatar ───────────────────────────────────────────────── */}
                <div className="flex-shrink-0 relative w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden">
                  <Image
                    src={seller.profileImage}
                    alt={seller.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    loading="lazy"
                    onError={(e) => handleImgError(e, FALLBACK_AVATAR)}
                  />
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                    {seller.name}
                  </h1>
                  <p className="text-sm sm:text-base mb-4 leading-relaxed text-white/90">
                    {seller.description}
                  </p>

                  <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <BsShopWindow className="w-4 h-4" />
                      <span>
                        {seller.yearsOnPlatform > 0
                          ? `${seller.yearsOnPlatform}+ Years on Sellapy`
                          : "New on Sellapy"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdOutlineTimer className="w-4 h-4" />
                      <span>24h Response time</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4">
                    <Button
                      variant="secondary"
                      className="bg-white/20 text-sm sm:text-base font-normal rounded-[12px] hover:bg-white/30 py-2.5 sm:py-3 px-4 text-white border-0"
                      onClick={showLoading}
                    >
                      <CiDiscount1 className="mr-1 text-lg" />
                      Discounts Available
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <SellerActionPanel
                seller={seller}
                isFollowLoading={isFollowLoading}
                handleFollow={handleFollow}
                followersData={followersData}
                isFollowersLoading={isFollowersLoading}
              />
            </div>
          </div>
        </div>
      </div>

      <StoreCouponsModal
        open={open}
        onClose={() => setOpen(false)}
        onReload={showLoading}
        storeId={storeId}
      />
    </>
  );
}
