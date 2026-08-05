"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { useGetPlatformDataForUserSupportQuery } from "@/redux/features/banner/bannerSlice";
import { Skeleton } from "antd";

interface Banner {
  id: string;
  bannerUrl: string;
  title: string;
  description: string;
  redirectUrl: string;
  platformId: string;
  createdAt: string;
  updatedAt: string;
}

export default function BannerSlider() {
  const { data, isLoading } = useGetPlatformDataForUserSupportQuery({});
  const banners = data?.result?.CmsSetting?.[0]?.platform?.banner || [];
  console.log(banners, "banners");

  return (
    <div className="md:bg-color-pinkf6 py-4 lg:py-16">
      <div className="container lg:px-16 md:px-14 sm:px-10 px-4 xl:px-0 mx-auto">
        <Swiper
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet",
            bulletActiveClass: "swiper-pagination-bullet-active-custom",
          }}
          modules={[Pagination, Autoplay]}
          className="w-full lg:h-[393px] sm:h-[600px] h-[550px] bg-white rounded-xl"
          spaceBetween={30}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full px-6">
              <Skeleton active />
            </div>
          ) : banners.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-color-60">No banners available.</p>
            </div>
          ) : (
            banners.map((banner: Banner, index: number) => (
              <SwiperSlide key={banner.id}>
                <div className="flex h-full lg:flex-row flex-col items-center px-4 sm:px-10">
                  {/* Left side - Title and button */}
                  <div className="flex-1 flex flex-col justify-center w-full py-6 lg:py-0">
                    <h2 className="text-[24px] sm:text-3xl lg:text-[40px] font-bold mb-2 sm:mb-4 text-color-32">
                      {banner.title}
                    </h2>
                    {banner.description && (
                      <p className="text-xs sm:text-base mb-3 sm:mb-6 text-color-60">
                        {banner.description}
                      </p>
                    )}
                    <Link
                      href={`${banner?.redirectUrl}`}
                      target="_blank"
                      className="inline-block px-4 py-2.5 bg-color-1c sm:text-md text-sm text-white font-bold rounded-md hover:bg-[#157FFB] duration-300 transition-colors w-fit"
                    >
                      Explore more
                    </Link>
                  </div>

                  {/* Right side - Banner image */}
                  <div className="flex-1 flex justify-center items-center w-full h-[250px] sm:h-[320px] lg:h-full">
                    <div className="relative w-full h-full overflow-hidden rounded-xl">
                      <Image
                        src={banner?.bannerUrl}
                        alt={banner?.title}
                        fill
                        className="object-cover rounded-xl"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+"
                        loading={index === 0 ? "eager" : "lazy"}
                        priority={index === 0}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (!img.dataset.fallback) {
                            img.src = "/fallback-banner.png";
                            img.dataset.fallback = "true";
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))
          )}
        </Swiper>

        <style jsx global>{`
          .swiper-pagination-bullet {
            width: 12px;
            height: 12px;
            background-color: transparent;
            border: 1px solid #343434;
            opacity: 1;
            margin: 0 6px !important;
          }
          .swiper-pagination-bullet-active-custom {
            background-color: #343434;
            border: 1px solid #343434;
          }
        `}</style>
      </div>
    </div>
  );
}
