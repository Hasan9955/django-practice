/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import OfferCard from "@/components/ui/offerCard";
import { useGetAllPromotionsQuery } from "@/redux/features/banner/bannerSlice";
import { Loader2 } from 'lucide-react';

export default function OffersPage() {
  const { data, isLoading, isError } = useGetAllPromotionsQuery({});

  const promotions = data?.result || [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6">
            Exclusive Offers
          </h1>
          <p className="text-xl text-blue-600 font-medium">
            Discover amazing deals on your favorite products
          </p>
          <div className="mt-8 h-1 w-20 bg-blue-500 mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Content Section */}   
      <section className="max-w-7xl mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-blue-600 font-medium">Loading offers...</p>
            </div>
          </div>
        ) : isError || promotions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-500">No offers available at this time</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promotion:any) => (
              <OfferCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
