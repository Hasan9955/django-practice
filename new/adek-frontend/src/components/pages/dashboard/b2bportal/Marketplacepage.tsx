/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs/tabs";
import { Skeleton } from "antd";
import SellerB2BProductCard from "@/components/ui/Card/sellerB2BProductCard";
import { B2BChatSeller } from "./B2BChatSeller";
import ConversationList, { Conversation } from "./Conversationlist";
import { useGetSellerB2BConversationsListQuery, useGetSellerB2BPackagesQuery } from "@/redux/features/dashborad/b2bProtal/b2bProtalApi";
import B2BOrdersList from "./B2BOrdersList";

type Tab = "feeds" | "conversation" | "order";

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<Tab>("feeds");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | undefined>(undefined);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: packagesData, isLoading: isPackagesLoading } =
    useGetSellerB2BPackagesQuery({});

  const { data: conversationsData, isLoading: isConversationsLoading } =
    useGetSellerB2BConversationsListQuery({});

  // Stable, memoised — never undefined
  const products = useMemo<any[]>(
    () => packagesData?.result?.data ?? [],
    [packagesData],
  );

  const initialConversations = useMemo<any[]>(
    () =>
      Array.isArray(conversationsData?.result)
        ? conversationsData.result
        : conversationsData?.result?.result ?? [],
    [conversationsData],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleEdit = (product: any) => console.log("Edit:", product);
  const handleMessage = (product: any) => console.log("Message:", product);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Page header (always visible) ──────────────────────────────── */}
      <div className="mb-4 rounded-[16px] bg-white flex flex-col items-start py-6 pr-6 pl-4 gap-4 self-stretch shadow-sm">
        <h2 className="text-[#322F35] font-bold text-[24px]">Contact seller</h2>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as Tab)}
          className="w-full max-w-sm"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg p-1 gap-1">
            <TabsTrigger
              value="feeds"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md text-sm font-medium transition-all"
            >
              Feeds
            </TabsTrigger>
            <TabsTrigger
              value="conversation"
              className="data-[state=active]:bg-white rounded-md text-sm font-medium transition-all"
            >
              Conversation
            </TabsTrigger>
            <TabsTrigger
              value="order"
              className="data-[state=active]:bg-white rounded-md text-sm font-medium transition-all"
            >
              Order
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ── Tab content ───────────────────────────────────────────────── */}

      {/* FEEDS — products grid + conversation sidebar */}
      {activeTab === "feeds" && (
        <div className="flex gap-6">
          {/* Products grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Available B2B Products
              </h3>
            </div>

            {isPackagesLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} active />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No products available
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {products.map((product: any, index: number) => (
                  <SellerB2BProductCard
                    key={product?.id ?? index}
                    product={product}
                    index={index}
                    onEdit={handleEdit}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Conversation sidebar */}
          <div className="w-80 shrink-0">
            {isConversationsLoading ? (
              <Skeleton active />
            ) : (
              <ConversationList
                conversations={initialConversations}
                onSelectConversation={(conv) => {
                  setSelectedConversation(conv);   // ✅ store selected conversation
                  setActiveTab("conversation");
                }}
                onSeeAll={() => setActiveTab("conversation")}
              />
            )}
          </div>
        </div>
      )}

      {/* CONVERSATION — full two-panel chat view */}
      {activeTab === "conversation" && (
        <B2BChatSeller
          conversationId={selectedConversation?.conversationId}
          participant={selectedConversation?.participants}
        />
      )}

      {/* ORDER — placeholder */}
      {activeTab === "order" && (
        <B2BOrdersList />
      )}
    </div>
  );
}