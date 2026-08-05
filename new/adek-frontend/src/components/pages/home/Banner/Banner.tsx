"use client";

import { rightArrow } from "@/assets/icons/Home/homeIcons";
import Image from "next/image";
import Link from "next/link";
import { useGetPlatformDataForUserSupportQuery } from "@/redux/features/banner/bannerSlice";
import { useGetMostPopularProductsQuery } from "@/redux/features/product/productApi";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import PriceDisplay from "@/components/PriceDisplay";

const Banner = () => {
  const router = useRouter();

  const { data: bannerData, isLoading: isLoadingBanner } =
    useGetPlatformDataForUserSupportQuery({});

  const { data: mostPopularProducts, isLoading: isLoadingMostPopularProducts } =
    useGetMostPopularProductsQuery({});

  const mostPopularProduct1 = mostPopularProducts?.result?.data?.[0];
  const mostPopularProduct2 = mostPopularProducts?.result?.data?.[1];

  // Combined loading state for whole banner
  const isLoading = isLoadingBanner || isLoadingMostPopularProducts;

  if (isLoading) {
    return (
      <div className="z-0">
        <div className="relative h-[100%] w-full bg-blue-primary">
          {/* Background placeholder */}
          <div className="bg-cover h-full absolute top-0 left-0 xl:w-full opacity-10 bg-gray-300" />

          <div className="sm:py-10 py-4 z-0 relative container lg:px-16 md:px-14 sm:px-10 px-6 xl:px-0 mx-auto">
            <div className="flex gap-4 sm:gap-10 flex-wrap items-center lg:flex-row justify-between">
              {/* Left text skeleton - exact same layout as loaded state */}
              <div className="flex flex-col justify-center items-start">
                <Skeleton className="h-9 w-[420px] mb-2 sm:mb-4" />
                <Skeleton className="h-5 w-[520px] mb-1" />
                <Skeleton className="h-5 w-[480px] mb-1" />
                <Skeleton className="h-5 w-[300px]" />
                <Skeleton className="mt-4 md:mt-8 h-9 w-40 rounded-lg" />
              </div>

              {/* Right products skeleton - exact same dimensions/classes */}
              <div className="flex flex-wrap justify-center lg:justify-end items-center lg:items-end gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                {/* First product card skeleton */}
                <div
                  className="
                    bg-blue-400/50 cursor-pointer relative rounded-xl
                    w-full sm:w-[220px] md:w-[240px] lg:w-[250px] xl:w-[280px]
                    h-auto sm:h-[280px] md:h-[300px] lg:h-[320px] xl:h-[340px]
                    p-3 sm:p-4
                  "
                >
                  <Skeleton className="h-6 w-28 absolute top-4 left-4 rounded-full" />
                  <Skeleton className="h-[200px] w-full mt-8 rounded-xl" />
                  <Skeleton className="h-6 w-3/4 mt-4" />
                  <div className="flex gap-3 mt-3">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>

                {/* Second product card skeleton */}
                <div
                  className="
                    bg-blue-400/50 cursor-pointer relative rounded-xl h-max
                    w-full sm:w-[180px] md:w-[200px] lg:w-[220px] xl:w-[250px]
                    p-3 sm:p-4
                  "
                >
                  <Skeleton className="h-[150px] w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
                  <div className="flex gap-3 justify-center mt-3">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="z-0">
      <div className="relative  h-[100%] w-full bg-blue-primary ">
        <Image
          src={bannerData?.result?.CmsSetting?.[0]?.bannerImage}
          width={1920}
          height={1080}
          alt={bannerData?.result?.CmsSetting?.[0]?.title ?? "Banner"}
          className="bg-cover h-full -z-0  absolute top-0 left-0 xl:w-full object-fill opacity-10 "
        />
        <div className="sm:py-10 py-4 z-0 relative container lg:px-16 md:px-14 sm:px-10 px-6 xl:px-0 mx-auto  ">
          <div className="flex gap-4 sm:gap-10  flex-wrap items-center lg:flex-row justify-between">
            <div className="flex flex-col justify-center items-start">
              <h4 className="text-white text-[24px] md:text-[32px] lg:text-[36px] font-extrabold max-w-[541px] leading-tight mb-2 sm:mb-4">
                {bannerData?.result?.CmsSetting?.[0]?.title}
              </h4>

              {/* ✅ Fixed: render HTML content from API */}
              <div
                className="text-white text-xs md:text-[18px] font-medium max-w-[541px] font-nun leading-[148%]"
                dangerouslySetInnerHTML={{
                  __html: bannerData?.result?.CmsSetting?.[0]?.aboutUs ?? "",
                }}
              />

              <Link href={bannerData?.result?.CmsSetting?.[0]?.redirectUrl}>
                <button className=" text-sm md:text-[16px] font-medium px-5 py-1.5 bg-blue-800 border-white border rounded-lg text-white flex items-center gap-1 mt-4 md:mt-8">
                  Explore <span>{rightArrow}</span>
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-end items-center lg:items-end gap-4 sm:gap-6 md:gap-8 lg:gap-10">
              {/* First Product Card — Primary / Larger */}
              <div
                className="
                      bg-blue-400/50 cursor-pointer relative rounded-xl
                      w-full sm:w-[220px] md:w-[240px] lg:w-[250px] xl:w-[280px]
                      h-auto sm:h-[280px] md:h-[300px] lg:h-[320px] xl:h-[340px]
                      p-3 sm:p-4
                    "
                onClick={() =>
                  router.push(`/products/${mostPopularProduct1?.id}`)
                }
              >
                <>
                  {/* Badge */}
                  <div
                    className="
          bg-yellow-400 text-black font-medium rounded-full absolute
          text-xs sm:text-sm
          px-2 py-0.5 sm:px-3 sm:py-1
          top-3 left-3 sm:top-4 sm:left-4
        "
                  >
                    Most popular
                  </div>

                  {/* Product Image */}
                  <div
                    className="flex justify-center items-center mt-6 sm:mt-2
          h-[160px] sm:h-[185px] md:h-[200px] lg:h-[205px] xl:h-[225px]
        "
                  >
                    <Image
                      src={mostPopularProduct1?.productPhoto?.[0]}
                      alt={
                        mostPopularProduct1?.productName || "Popular Product"
                      }
                      height={200}
                      width={200}
                      className="
              w-auto object-contain
              h-[160px] sm:h-[185px] md:h-[200px] lg:h-[205px] xl:h-[225px]
            "
                    />
                  </div>

                  {/* Product Name */}
                  <div
                    className="
          font-medium truncate mt-2
          text-sm sm:text-base md:text-lg lg:text-xl
        "
                  >
                    {mostPopularProduct1?.productName}
                  </div>

                  {/* Price */}
                  <div className="text-white flex items-end gap-1 flex-wrap mt-2 sm:mt-3">
                    <PriceDisplay
                      basePrice={mostPopularProduct1?.discountPrice}
                      showCode={false}
                      className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl"
                    />
                    <PriceDisplay
                      basePrice={mostPopularProduct1?.basePrice}
                      showCode={false}
                      className="text-red-400 line-through text-xs sm:text-sm md:text-base"
                    />
                  </div>
                </>
              </div>

              {/* Second Product Card — Secondary / Smaller */}
              <div
                onClick={() =>
                  router.push(`/products/${mostPopularProduct2?.id}`)
                }
                className="
      bg-blue-400/50 cursor-pointer relative rounded-xl h-max
      w-full sm:w-[180px] md:w-[200px] lg:w-[220px] xl:w-[250px]
      p-3 sm:p-4
    "
              >
                <>
                  {/* Product Image */}
                  <div className="flex justify-center items-center">
                    <Image
                      src={mostPopularProduct2?.productPhoto?.[0]}
                      alt={
                        mostPopularProduct2?.productName || "Popular Product"
                      }
                      height={150}
                      width={150}
                      className="
              w-auto object-contain
              h-[100px] sm:h-[120px] md:h-[130px] lg:h-[140px] xl:h-[150px]
            "
                    />
                  </div>

                  {/* Product Name + Price */}
                  <div className="text-white text-center mt-3 sm:mt-4">
                    <div
                      className="
            font-medium truncate
            text-sm sm:text-base md:text-lg lg:text-xl
          "
                    >
                      {mostPopularProduct2?.productName}
                    </div>

                    <div className="flex items-end justify-start gap-1 flex-wrap mt-1 sm:mt-2">
                      <PriceDisplay
                        basePrice={mostPopularProduct2?.discountPrice}
                        showCode={false}
                        className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl"
                      />
                      <PriceDisplay
                        basePrice={mostPopularProduct2?.basePrice}
                        showCode={false}
                        className="text-red-400 line-through text-xs sm:text-sm md:text-base"
                      />
                    </div>
                  </div>
                </>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
