// refund-request-sidebar.tsx
"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/Avatar/avatar";
import { Plus, Search, Package, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/Input/Input";
import type { RefundRequest } from "@/types/refund-types";

// Re-export so existing imports don't break
export type { RefundRequest };

interface RefundRequestSidebarProps {
  requests: RefundRequest[];
  selectedRequestId: string;
  onSelectRequest: (id: string) => void;
  onAddNewRequest: () => void;
}

const STATUS_CONFIG: Record<
  RefundRequest["refundStatus"],
  { label: string; dot: string; text: string }
> = {
  PENDING: { label: "Pending", dot: "bg-amber-400", text: "text-amber-700" },
  IN_PROGRESS: {
    label: "In Progress",
    dot: "bg-blue-500",
    text: "text-blue-700",
  },
  RESOLVED: {
    label: "Resolved",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  REJECTED: { label: "Rejected", dot: "bg-red-500", text: "text-red-700" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function RefundRequestSidebar({
  requests,
  selectedRequestId,
  onSelectRequest,
  onAddNewRequest,
}: RefundRequestSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = requests.filter((req) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      req.productName?.toLowerCase().includes(q) ||
      req.userName?.toLowerCase().includes(q) ||
      req.orderNumber?.toLowerCase().includes(q) ||
      req.refundReason?.toLowerCase().includes(q) ||
      req.lastMessage?.toLowerCase().includes(q)
    );
  });

  const totalUnread = requests.filter((r) => (r.unseen ?? 0) > 0).length;

  return (
    <div
      className="w-[320px] flex flex-col h-full border-r"
      style={{ background: "#fff", borderColor: "#e5e7eb" }}
    >
      {/* ── Header ── */}
      <div
        className="px-5 pt-5 pb-4 border-b"
        style={{ borderColor: "#e5e7eb" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ background: "#1d4ed8" }}
            >
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-[15px] font-semibold"
              style={{ color: "#0f172a" }}
            >
              Refund Requests
            </span>
          </div>
          {requests.length > 0 && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "#eff6ff", color: "#1d4ed8" }}
            >
              {requests.length}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "#9ca3af" }}
          />
          <Input
            type="text"
            placeholder="Search requests…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm rounded-lg border"
            style={{
              background: "#f8fafc",
              borderColor: "#e2e8f0",
              color: "#0f172a",
            }}
          />
        </div>

        {/* New Request button */}
        <button
          onClick={onAddNewRequest}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98]"
          style={{ background: "#1d4ed8", color: "#fff" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1e40af")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1d4ed8")}
        >
          <Plus className="w-4 h-4" />
          New Refund Request
        </button>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: "#f1f5f9" }}
            >
              <Package className="w-7 h-7" style={{ color: "#94a3b8" }} />
            </div>
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "#0f172a" }}
            >
              {searchQuery ? "No results found" : "No requests yet"}
            </p>
            <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>
              {searchQuery
                ? "Try a different search term"
                : "Create your first refund request"}
            </p>
            {!searchQuery && (
              <button
                onClick={onAddNewRequest}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
                style={{ borderColor: "#1d4ed8", color: "#1d4ed8" }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Request
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "#f1f5f9" }}>
            {filtered.map((req) => {
              const isSelected = req.id === selectedRequestId;
              const unreadCount = req.unseen ?? 0;
              const cfg = STATUS_CONFIG[req.refundStatus];

              return (
                <li key={req.id}>
                  <button
                    onClick={() => onSelectRequest(req.id)}
                    className="w-full text-left px-4 py-3.5 relative transition-colors duration-100 focus:outline-none"
                    style={{
                      background: isSelected ? "#eff6ff" : "transparent",
                      borderLeft: isSelected
                        ? "3px solid #1d4ed8"
                        : "3px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Row 1: time + status */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[11px]"
                        style={{ color: "#94a3b8" }}
                      >
                        {req.lastMessageTime
                          ? formatDistanceToNow(new Date(req.lastMessageTime), {
                              addSuffix: true,
                            })
                          : "Just now"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${cfg.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                        />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Row 2: product + order */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className="text-sm font-semibold truncate flex-1 leading-tight"
                        style={{ color: isSelected ? "#1d4ed8" : "#0f172a" }}
                      >
                        {req.productName || "Unknown Product"}
                      </span>
                      {req.orderNumber && (
                        <span
                          className="text-[11px] font-mono font-semibold flex-shrink-0"
                          style={{ color: "#f59e0b" }}
                        >
                          #{req.orderNumber}
                        </span>
                      )}
                    </div>

                    {/* Row 3: avatar + name */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <Avatar className="w-5 h-5 flex-shrink-0">
                        <AvatarImage src={req.userAvatar} alt={req.userName} />
                        <AvatarFallback
                          className="text-[9px] font-bold"
                          style={{ background: "#dbeafe", color: "#1d4ed8" }}
                        >
                          {req.userName ? getInitials(req.userName) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className="text-xs font-medium truncate"
                        style={{ color: "#475569" }}
                      >
                        {req.userName || "Unknown User"}
                      </span>
                    </div>

                    {/* Row 4: last message + unread badge */}
                    {(req.lastMessage || unreadCount > 0) && (
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className="text-xs truncate flex-1"
                          style={{
                            color:
                              unreadCount > 0 && !isSelected
                                ? "#0f172a"
                                : "#94a3b8",
                            fontWeight:
                              unreadCount > 0 && !isSelected ? 600 : 400,
                          }}
                        >
                          {req.lastMessage || ""}
                        </p>
                        {unreadCount > 0 && (
                          <span
                            className="flex-shrink-0 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: "#1d4ed8", color: "#fff" }}
                          >
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Footer stats ── */}
      {requests.length > 0 && (
        <div
          className="px-5 py-2.5 border-t flex items-center justify-between"
          style={{ borderColor: "#e5e7eb", background: "#f8fafc" }}
        >
          <span className="text-[11px]" style={{ color: "#94a3b8" }}>
            {filtered.length} of {requests.length} shown
          </span>
          {totalUnread > 0 && (
            <span
              className="text-[11px] font-medium"
              style={{ color: "#1d4ed8" }}
            >
              {totalUnread} unread
            </span>
          )}
        </div>
      )}
    </div>
  );
}
