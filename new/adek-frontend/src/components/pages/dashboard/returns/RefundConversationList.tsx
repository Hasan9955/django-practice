// RefundConversationList.tsx
"use client";

import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/Avatar/avatar";
import { Package } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────
// Inline here to avoid importing antd or duplicating from @/types/refund —
// whichever your project uses, this matches the shape exactly.

interface Participant {
  userId: string;
  username: string;
  image?: string;
}

export interface RefundConversation {
  refundConversationId: string;
  refundReason: string;
  refundStatus: string;
  type: string;
  participants: Participant;
  productId: string;
  productName: string;
  productImage: string[];
  orderNumber: string;
  lastMessage: string;
  lastMessageTime: string;
  unseen: number;
}

interface RefundConversationListProps {
  conversations: RefundConversation[];
  isLoading: boolean;
  selectedConversation?: string;
  onSelectConversation?: (id: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * BUG FIX #7 — was using toLocaleString() which produces long ugly strings.
 * Now uses relative time ("2 hours ago") matching the sidebar in Defended.tsx.
 */
function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

/**
 * BUG FIX #9 — was using Tailwind color classes that clash with the inline-style
 * design system. Now uses the same STATUS_CFG pattern as Defended.tsx.
 */
const STATUS_CFG: Record<
  string,
  { dot: string; text: string; bg: string; label: string }
> = {
  APPROVED: {
    dot: "#10b981",
    text: "#065f46",
    bg: "#ecfdf5",
    label: "Approved",
  },
  PENDING: { dot: "#f59e0b", text: "#92400e", bg: "#fffbeb", label: "Pending" },
  REJECTED: {
    dot: "#ef4444",
    text: "#991b1b",
    bg: "#fef2f2",
    label: "Rejected",
  },
};

function statusCfg(status: string) {
  return (
    STATUS_CFG[status] ?? {
      dot: "#94a3b8",
      text: "#475569",
      bg: "#f1f5f9",
      label: status,
    }
  );
}

// ─── Skeleton loader — no antd dependency ────────────────────────────────────
// BUG FIX #1 — replaced antd <Skeleton> with a pure CSS skeleton that matches
// the design system and requires no extra dependency.

function SkeletonRow() {
  return (
    <div className="px-4 py-3.5 border-b" style={{ borderColor: "#f1f5f9" }}>
      <div className="flex items-center gap-3">
        {/* Avatar skeleton */}
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 animate-pulse"
          style={{ background: "#e2e8f0" }}
        />
        <div className="flex-1 space-y-1.5">
          {/* Name row */}
          <div className="flex items-center justify-between gap-2">
            <div
              className="h-3 rounded animate-pulse"
              style={{ background: "#e2e8f0", width: "55%" }}
            />
            <div
              className="h-3 rounded animate-pulse"
              style={{ background: "#e2e8f0", width: "20%" }}
            />
          </div>
          {/* Product row */}
          <div
            className="h-2.5 rounded animate-pulse"
            style={{ background: "#f1f5f9", width: "75%" }}
          />
          {/* Last message row */}
          <div
            className="h-2.5 rounded animate-pulse"
            style={{ background: "#f1f5f9", width: "60%" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const RefundConversationList: React.FC<RefundConversationListProps> = ({
  conversations,
  isLoading,
  selectedConversation,
  onSelectConversation,
}) => {
  // BUG FIX #1 — no antd Skeleton
  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: "#f1f5f9" }}
        >
          <Package className="w-6 h-6" style={{ color: "#94a3b8" }} />
        </div>
        <p className="text-sm font-medium" style={{ color: "#0f172a" }}>
          No disputes found
        </p>
        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
          No refund conversations match your search
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y" style={{ borderColor: "#f1f5f9" }}>
      {conversations.map((conv) => {
        const isSelected = selectedConversation === conv.refundConversationId;
        const cfg = statusCfg(conv.refundStatus);
        // BUG FIX #6 — unseen count now actually rendered
        const unread = conv.unseen ?? 0;

        return (
          <li key={conv.refundConversationId}>
            <button
              type="button"
              onClick={() => onSelectConversation?.(conv.refundConversationId)}
              className="w-full text-left px-4 py-3.5 duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{
                background: isSelected ? "#eff6ff" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Row 1: time + status */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px]" style={{ color: "#94a3b8" }}>
                  {/* BUG FIX #7 — relative time instead of toLocaleString() */}
                  {conv.lastMessageTime
                    ? relativeTime(conv.lastMessageTime)
                    : "Just now"}
                </span>

                {/* Status dot + label — BUG FIX #9 */}
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-medium"
                  style={{ color: cfg.text }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: cfg.dot }}
                  />
                  {cfg.label}
                </span>
              </div>

              {/* Row 2: avatar + name + unread */}
              <div className="flex items-center gap-2.5 mb-1.5">
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarImage
                    src={conv.participants.image}
                    alt={conv.participants.username}
                  />
                  <AvatarFallback
                    className="text-[9px] font-bold"
                    style={{ background: "#dbeafe", color: "#1d4ed8" }}
                  >
                    {getInitials(conv.participants.username || "?")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="text-sm font-semibold truncate"
                      style={{ color: isSelected ? "#1d4ed8" : "#0f172a" }}
                    >
                      {conv.participants.username}
                    </span>

                    {/* BUG FIX #6 — unread badge now rendered */}
                    {unread > 0 && (
                      <span
                        className="flex-shrink-0 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: "#1d4ed8", color: "#fff" }}
                      >
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </div>

                  {/* Product name */}
                  <p
                    className="text-xs truncate leading-tight"
                    style={{ color: "#64748b" }}
                  >
                    {conv.productName}
                    {conv.orderNumber && (
                      <span
                        className="font-mono font-semibold ml-1"
                        style={{ color: "#f59e0b" }}
                      >
                        #{conv.orderNumber}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Row 3: refund reason (short) */}
              <p
                className="text-xs truncate leading-tight mb-1"
                style={{ color: "#475569", fontStyle: "italic" }}
              >
                {conv.refundReason}
              </p>

              {/* Row 4: last message preview — BUG FIX #5 (was never rendered) */}
              {conv.lastMessage && (
                <p
                  className="text-xs truncate"
                  style={{
                    color: unread > 0 && !isSelected ? "#0f172a" : "#94a3b8",
                    fontWeight: unread > 0 && !isSelected ? 600 : 400,
                  }}
                >
                  {conv.lastMessage}
                </p>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
};
