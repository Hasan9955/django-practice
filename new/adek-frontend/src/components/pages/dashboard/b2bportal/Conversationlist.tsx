/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar/avatar";
import { Button } from "@/components/ui/Button/Button";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OfferItem {
  id?: string;
  productId?: string;
  offerId?: string;
  unitPrice?: number;
  quantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface OfferMessage {
  id?: string;
  conversationId?: string;
  offerStuts?: string;
  isDelivered?: boolean;
  buyerId?: string;
  sellerId?: string;
  expectedDeliveryDate?: string;
  totalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
  offer_Items?: OfferItem[];
}

interface Participant {
  userId?: string;
  username?: string;
  image?: string;
}

export interface Conversation {
  conversationId?: string;
  type?: string;
  participants?: Participant;
  lastMessage?: string;
  lastMessageTime?: string;
  unseen?: number;
}

interface ConversationListProps {
  conversations?: Conversation[] | any[];
  onSelectConversation?: (conversation?: Conversation) => void;
  onSeeAll?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalise(raw: ConversationListProps["conversations"]): Conversation[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Conversation[];
  return [];
}

function parseLastMessage(msg?: string): OfferMessage | string | null {
  if (!msg) return null;
  try {
    const parsed = JSON.parse(msg);
    if (typeof parsed === "object" && parsed !== null) return parsed as OfferMessage;
    return msg;
  } catch {
    return msg;
  }
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getOfferStatusLabel(status?: string): string {
  switch (status?.toUpperCase()) {
    case "PENDING": return "Pending Offer";
    case "ACCEPTED": return "Offer Accepted";
    case "REJECTED": return "Offer Rejected";
    default: return "New Offer";
  }
}

function getOfferStatusColor(status?: string): string {
  switch (status?.toUpperCase()) {
    case "PENDING": return "bg-amber-50 text-amber-600 border border-amber-200";
    case "ACCEPTED": return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    case "REJECTED": return "bg-red-50 text-red-500 border border-red-200";
    default: return "bg-blue-50 text-blue-600 border border-blue-200";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConversationList({
  conversations,
  onSelectConversation,
  onSeeAll,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  const list = normalise(conversations);

  const filtered = list.filter((conv) => {
    const name = conv.participants?.username ?? "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-80 flex flex-col shadow-md rounded-xl overflow-hidden border border-gray-200 bg-white">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-900">Messages</h2>
            {list.length > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {list.length}
              </span>
            )}
          </div>
          <Button
            variant="link"
            className="text-orange-500 hover:text-orange-600 text-xs p-0 h-auto font-medium"
            onClick={onSeeAll}
          >
            See all
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200 focus-within:border-orange-400 transition-colors">
          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs bg-transparent outline-none flex-1 text-gray-700 placeholder-gray-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-300 hover:text-gray-500 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-gray-500">No conversations found</p>
            {search && (
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            )}
          </div>
        ) : (
          filtered.map((conv, index) => {
            const parsed = parseLastMessage(conv.lastMessage);
            const isOffer = typeof parsed === "object" && parsed !== null;
            const offer = isOffer ? (parsed as OfferMessage) : null;

            const plainText = typeof parsed === "string" ? parsed : null;

            const participant = conv.participants;
            const timeAgo = formatTime(conv.lastMessageTime);
            const code = conv.conversationId
              ? `#${conv.conversationId.slice(-6).toUpperCase()}`
              : "#------";

            const productCount = offer?.offer_Items?.length ?? 0;
            const totalPrice = offer?.totalPrice ?? 0;
            const isActive = activeId === conv.conversationId;
            const hasUnseen = (conv.unseen ?? 0) > 0;

            return (
              <div
                key={conv.conversationId ?? index}
                className={`relative px-4 py-3 cursor-pointer transition-colors ${
                  isActive ? "bg-orange-50" : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  setActiveId(conv.conversationId);
                  onSelectConversation?.(conv);
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-500 rounded-r" />
                )}

                {/* Top row: time + code */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-gray-400">{timeAgo}</span>
                  <span className="text-[10px] text-orange-500 font-medium">{code}</span>
                </div>

                {/* User row */}
                <div className="flex items-center gap-2.5">
                  {/* Avatar with online dot */}
                  <div className="relative shrink-0">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={participant?.image || "/placeholder.svg"}
                        alt={participant?.username}
                      />
                      <AvatarFallback className="text-xs bg-orange-100 text-orange-600 font-semibold">
                        {participant?.username?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Name + message preview */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-semibold text-gray-900 truncate">
                        {participant?.username ?? "Unknown User"}
                      </span>
                      {hasUnseen && (
                        <span className="bg-orange-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                          {conv.unseen}
                        </span>
                      )}
                    </div>

                    {/* Message preview */}
                    {isOffer ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getOfferStatusColor(offer?.offerStuts)}`}>
                          {getOfferStatusLabel(offer?.offerStuts)}
                        </span>
                        {productCount > 0 && (
                          <span className="text-[10px] text-gray-400">
                            {productCount} item{productCount > 1 ? "s" : ""}
                            {totalPrice > 0 && ` · $${totalPrice.toLocaleString()}`}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 truncate">{plainText}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}