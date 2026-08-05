"use client";

import CollapsibleFAQ from "@/components/ui/CollapsableFaqs/CollapsableFaqs";
import { useGetCmsContentQuery } from "@/redux/features/banner/bannerSlice";
import { Skeleton } from "antd";
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  cmsSettingId: string;
  createdAt: string;
  updatedAt: string;
}

export default function BestChoisePlan() {
  const { data, isLoading } = useGetCmsContentQuery({});
  const faqData = data?.result?.faq || [];

  return (
    <div className="container lg:px-16 md:px-14 sm:px-10 px-6 xl:px-0 mx-auto pt-4 sm:py-8">
      <div>
        <h1 className="sm:text-2xl text-lg font-semibold text-gray-800 mb-6">
          Sellapy: Your Best Choice for Niche Brands Online Shopping
        </h1>

        <div className="mt-6 space-y-3">
          {isLoading ? (
            <Skeleton active />
          ) : faqData.length === 0 ? (
            "not faq"
          ) : faqData.length > 0 ? (
            faqData.map((faq: FAQItem) => (
              <CollapsibleFAQ
                key={faq.id}
                question={faq.question}
                answer={<p className="text-sm text-gray-600">{faq.answer}</p>}
              />
            ))
          ) : (
            !isLoading && (
              <p className="text-gray-500 text-sm">
                No FAQs available at the moment.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
