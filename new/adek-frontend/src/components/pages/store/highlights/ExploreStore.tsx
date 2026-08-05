/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { StoreCard, StoreData } from "@/components/ui/Card/StoreCard";
import { useGetStoresQuery } from "@/redux/features/storeapi/storeApi";
import { Skeleton } from "antd";
import { ChevronDown } from "lucide-react";

const ExploreStore = () => {
  const [expanded, setExpanded] = useState(false);

  // ✅ First fetch: 3 | After click: fetch all (limit: 1000 or your max)
  const { data, isLoading, isFetching } = useGetStoresQuery({
    limit: expanded ? 1000 : 3,
  });

  const stores: StoreData[] =
    data?.result?.data?.map((store: any) => ({
      id: store?.id ?? "",
      name: store?.name ?? "Unnamed Store",
      bannerImage:
        store?.bannerImage || "/placeholder.svg?height=300&width=768",
      products:
        store?.Product?.map((p: any) => ({
          name: p?.productName ?? "Unnamed Product",
          image:
            p?.productPhoto?.[0] || "/placeholder.svg?height=168&width=168",
        })) || [],
    })) || [];

  const total = data?.result?.meta?.total ?? 0;

  // 🧱 Initial loading skeleton
  if (isLoading) {
    return (
      <main className="w-full h-auto bg-[#F6F6F6]">
        <section className="max-w-screen-xl mx-auto flex flex-col items-center justify-center py-10 md:py-20 px-4">
          <h2 className="text-primary text-center font-nun text-2xl sm:text-3xl lg:text-[40px] font-bold leading-[124%] mb-8">
            Explore Popular Stores
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                active
                paragraph={{ rows: 4 }}
                className="p-4 rounded-lg border border-gray-200 bg-white"
              />
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="w-full h-auto bg-[#F6F6F6]">
      <section className="max-w-screen-xl mx-auto flex flex-col items-center justify-center py-10 md:py-20 px-4">
        <h2 className="text-primary text-center font-nun text-2xl sm:text-3xl lg:text-[40px] font-bold leading-[124%]">
          Explore Popular Stores
        </h2>

        {/* ✅ Store Grid */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 mt-6 sm:mt-8 lg:mt-12">
          {stores.length > 0 ? (
            stores.map((store) => <StoreCard key={store.id} store={store} />)
          ) : (
            <p className="text-gray-500 text-sm text-center col-span-full">
              No stores available at the moment.
            </p>
          )}

          {/* ✅ Show skeleton placeholders while fetching expanded data */}
          {isFetching &&
            expanded &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={`fetching-${i}`}
                active
                paragraph={{ rows: 4 }}
                className="p-4 rounded-lg border border-gray-200 bg-white"
              />
            ))}
        </div>

        {/* ✅ Show button only if more stores exist and not expanded yet */}
        {!expanded && total > 3 && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => setExpanded(true)}
              className="bg-orange-400 hover:bg-orange-500 text-white flex items-center"
            >
              See more
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </section>
    </main>
  );
};

export default ExploreStore;