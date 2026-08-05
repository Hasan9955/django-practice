/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "antd";
import type { GetProps } from "antd";
import { StoreCard, StoreData } from "@/components/ui/Card/StoreCard";
import { useGetStoresQuery } from "@/redux/features/storeapi/storeApi";
import { Skeleton } from "antd";
import { Button } from "@/components/ui/Button/Button";

type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;

export default function ExplorePopularStores() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isFetching } = useGetStoresQuery({
    limit: 6,
    search: searchTerm,
    page: 1,
  });

  const onSearch: SearchProps["onSearch"] = (value) => {
    setSearchTerm(value.trim());
  };

  const onChange: SearchProps["onChange"] = (e) => {
    if (e.target.value === "") {
      setSearchTerm("");
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="bg-color-pinkf6 pb-6 sm:pb-12 px-6 lg:px-8">
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              active
              paragraph={{ rows: 4 }}
              className="p-4 rounded-lg border border-gray-200 bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  const stores: StoreData[] =
    data?.result?.data?.map((store: any) => ({
      id: store?.id ?? "",
      name: store?.shopName ?? "Unnamed Store",
      bannerImage:
        store?.bannerImage || "/placeholder.svg?height=300&width=768",
      products:
        store?.Product?.map((p: any) => ({
          name: p?.productName ?? "Unnamed Product",
          image:
            p?.productPhoto?.[0] || "/placeholder.svg?height=168&width=168",
        })) || [],
    })) || [];

  return (
    <section className="bg-color-pinkf6 pb-6 sm:pb-12 px-6 lg:px-8">
      <div className="container mx-auto px:0">
        <div className="flex justify-between flex-wrap gap-4 items-start mb-6">
          <div>
            <h2 className="text-[24px] sm:text-3xl font-bold text-gray-900">
              Explore Popular Stores
            </h2>
            <p className="mt-2 text-sm text-gray-600 max-w-[644px]">
              Discover top-rated shops handpicked by our community and powered
              by <br className="hidden sm:block" /> Sellapy&apos;s smart
              storefront system.
            </p>
          </div>
          <div className="flex gap-2">
            <Search
              placeholder="Search stores..."
              onSearch={onSearch}
              onChange={onChange}  
              allowClear
              enterButton
              size="large"
              className="max-w-md"
            />

            <Link href="/stores" className="hidden md:block">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Explore more stores
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {stores.length > 0 ? (
            stores
              .slice(0, 6)
              .map((store: any) => <StoreCard key={store.id} store={store} />)
          ) : (
            <p className="text-gray-500 text-sm col-span-full text-center">
              {searchTerm
                ? `No stores found for "${searchTerm}".`
                : "No stores available at the moment."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}