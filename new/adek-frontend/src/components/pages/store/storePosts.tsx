/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useGetMostPopularProductsQuery } from "@/redux/features/product/productApi";
import { Skeleton } from "antd";
import PriceDisplay from "@/components/PriceDisplay";
import { useRouter } from "next/navigation";

interface StorePost {
  id: string;
  title: string;
  price: number;
  image: string | StaticImageData;
}

export default function StorePosts() {
  const { data, isLoading } = useGetMostPopularProductsQuery({});
  const router = useRouter();

  if (isLoading) return <Skeleton active />;

  // Map API data to StorePost format and limit to 4 items
  const storePosts: StorePost[] =
    data?.result?.data
      .slice(0, 4) // maximum 4 products
      .map((item: any) => ({
        id: item.id,
        title: item?.productName,
        price: item?.discountPrice ?? item?.basePrice,
        image: item?.productPhoto?.[0] || "/placeholder.png",
      })) || [];

  return (
    <div className="rounded-lg container lg:px-16 md:px-14 sm:px-10 px-6 xl:px-0 mx-auto p-6 mt-[64px] mb-[70px]">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Most Popular Products
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {storePosts.map((post) => (
          <div
            key={post?.id}
            className="group cursor-pointer h-[500px] flex flex-col rounded-lg overflow-hidden shadow-md"
            onClick={() => router.push(`/products/${post?.id}`)}
          >
            <div className="relative w-full h-[400px]">
              <Image
                src={post?.image}
                alt={post?.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="flex-1 p-4 flex flex-col justify-between">
              <h3 className="text-base font-nun font-semibold text-gray-700 mb-2 line-clamp-2">
                {post?.title}
              </h3>
              <PriceDisplay
                basePrice={post?.price}
                showCode={false}
                className="text-lg font-medium font-nun text-gray-700"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
