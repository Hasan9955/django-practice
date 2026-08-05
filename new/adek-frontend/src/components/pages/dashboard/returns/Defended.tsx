// Defended.tsx — Seller Refund Management
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import {
  Search,
  Send,
  Paperclip,
  X,
  CheckCircle,
  XCircle,
  ShieldAlert,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/Input/Input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/Avatar/avatar";
import { useGetSellerRefundConversationListQuery } from "@/redux/features/dashborad/sellerdashboard/sellerDashboardApi";
import {
  useUpdateRefundStatusMutation,
  useUpdateMessageStatusMutation,
  useGetSingleRefundMessagesQuery,
} from "@/redux/features/refund/refundApi";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { RefundConversation } from "@/types/refund";
import { RefundConversationList } from "./RefundConversationList";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useImageUploadMutation } from "@/redux/features/logo/logoSlice";
import { format, isToday, isYesterday } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  content: string;
  timestamp: string; // display string: "h:mm a"
  createdAt: string; // ISO string for sorting
  sender: "seller" | "customer" | "system" | "admin";
  imageUrl?: string;
  senderId?: string;
  isTemp?: boolean;
}

interface DisputeRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerAvatar?: string;
  product: { name: string; images: string[] };
  issue: string;
  status: "pending" | "accepted" | "rejected";
  timestamp: string;
  messages: Message[];
  showDefenseRequest: boolean;
  conversationId?: string;
  customerId?: string;
  unseen?: number;
}

// ─── Helpers (outside component to avoid re-creation) ────────────────────────

const WS_URL = "wss://api.sellapy.com";

function formatContent(content: string): string {
  try {
    const parsed = JSON.parse(content);
    if (parsed.refundReason) {
      return `Refund Request\nReason: ${parsed.refundReason}\nProduct: ${parsed.productName}\nOrder: ${parsed.orderNumber}`;
    }
  } catch {
    /* not JSON */
  }
  return content;
}

function toDisplayTime(isoOrDate: string | Date): string {
  return format(new Date(isoOrDate), "h:mm a");
}

function dayLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const STATUS_CFG = {
  accepted: {
    dot: "#10b981",
    text: "#065f46",
    bg: "#ecfdf5",
    label: "Accepted",
  },
  rejected: {
    dot: "#ef4444",
    text: "#991b1b",
    bg: "#fef2f2",
    label: "Rejected",
  },
  pending: { dot: "#f59e0b", text: "#92400e", bg: "#fffbeb", label: "Pending" },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function Defended() {
  const token = useAppSelector((s: RootState) => s.auth.access_token);
  const userId = useAppSelector((s: RootState) => s.auth.user?.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<string | undefined>();
  const [disputes, setDisputes] = useState<DisputeRequest[]>([]);
  const [adminMessages, setAdminMessages] = useState<Record<string, Message[]>>(
    {},
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasJoinedApp = useRef(false);
  const currentChatRef = useRef<string | null>(null);

  const processedIds = useRef<Record<string, Set<string>>>({});

  const getProcessed = (convId: string): Set<string> => {
    if (!processedIds.current[convId]) {
      processedIds.current[convId] = new Set();
    }
    return processedIds.current[convId];
  };

  // ── REST queries ────────────────────────────────────────────────────────────
  const { data, isLoading } = useGetSellerRefundConversationListQuery("");
  const conversations: RefundConversation[] = data?.result?.result || [];

  const [updateRefundStatus, { isLoading: isUpdatingStatus }] =
    useUpdateRefundStatusMutation();
  const [updateMessageStatus] = useUpdateMessageStatusMutation();
  const [imageUpload] = useImageUploadMutation();

  const { data: refundMessagesData } = useGetSingleRefundMessagesQuery(
    selectedDispute ? { refundConversationId: selectedDispute } : skipToken,
  );

  // ── WebSocket ────────────────────────────────────────────────────────────────
  const socketUrl = token
    ? `${WS_URL}?token=${encodeURIComponent(token)}`
    : null;

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketUrl,
    {
      shouldReconnect: (e) => e.code !== 1000,
      reconnectAttempts: 5,
      reconnectInterval: (n) => Math.min(1000 * 2 ** n, 10_000),
      heartbeat: {
        message: JSON.stringify({ type: "ping" }),
        returnMessage: "pong",
        interval: 25_000,
        timeout: 60_000,
      },
      onOpen: () => {
        console.log("✅ [SELLER WS] Connected");
        hasJoinedApp.current = false;
      },
      onClose: (e) => {
        console.log("⚠️ [SELLER WS] Disconnected", e.code);
        hasJoinedApp.current = false;
        currentChatRef.current = null;
      },
      onError: (e) => console.error("❌ [SELLER WS] Error", e),
    },
    !!token,
  );

  /* Join app once per connection */
  useEffect(() => {
    if (readyState === ReadyState.OPEN && !hasJoinedApp.current) {
      sendJsonMessage({ type: "joinApp" });
      hasJoinedApp.current = true;
    }
    if (readyState === ReadyState.CLOSED) hasJoinedApp.current = false;
  }, [readyState, sendJsonMessage]);

  /* Join chat room — only when selectedDispute or readyState changes */
  const joinRefundChat = useCallback(
    (conversationId: string) => {
      if (
        readyState === ReadyState.OPEN &&
        hasJoinedApp.current &&
        currentChatRef.current !== conversationId
      ) {
        sendJsonMessage({ type: "joinRefundChat", refundId: conversationId });
        currentChatRef.current = conversationId;
      }
    },
    [readyState, sendJsonMessage],
  );

  // ── Load conversations into state ────────────────────────────────────────────
  useEffect(() => {
    if (!conversations.length) return;

    setDisputes((prev) => {
      const mapped: DisputeRequest[] = conversations.map((conv) => {
        // Preserve existing messages for conversations already loaded
        const existing = prev.find((d) => d.id === conv.refundConversationId);
        return {
          id: conv.refundConversationId,
          orderId: conv.orderNumber,
          customerName: conv.participants.username,
          customerAvatar: conv.participants.image,
          customerId: conv.participants.userId,
          product: { name: conv.productName, images: conv.productImage || [] },
          issue: conv.refundReason,
          status:
            conv.refundStatus === "APPROVED"
              ? "accepted"
              : conv.refundStatus === "REJECTED"
              ? "rejected"
              : "pending",
          timestamp: conv.lastMessageTime,
          messages: existing?.messages ?? [],
          showDefenseRequest: conv.refundStatus === "PENDING",
          conversationId: conv.refundConversationId,
          unseen: conv.unseen,
        };
      });
      return mapped;
    });
  }, [data]);

  /* Auto-select first on load */
  useEffect(() => {
    if (disputes.length > 0 && !selectedDispute) {
      setSelectedDispute(disputes[0].id);
    }
  }, [disputes.length]);

  // ── Load messages for selected conversation ───────────────────────────────────
  useEffect(() => {
    if (!selectedDispute || !refundMessagesData?.result) return;

    const allMessages: Message[] = refundMessagesData.result?.map((m: any) => {
      const isOwn = m.senderId === userId;
      const dispute = disputes.find((d) => d.id === selectedDispute);
      const customerId = dispute?.customerId;

      const sender: Message["sender"] = isOwn
        ? "seller"
        : m.senderId === customerId
        ? "customer"
        : "admin";

      return {
        id: m.id,
        senderId: m.senderId,
        content: formatContent(m.content),
        imageUrl: m.imageUrl || undefined,
        timestamp: toDisplayTime(m.createdAt),
        createdAt: m.createdAt,
        sender,
      } as Message;
    });

    const sorted = [...allMessages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const adminMsgs = sorted.filter((m) => m.sender === "admin");
    const regularMsgs = sorted.filter((m) => m.sender !== "admin");

    // Mark all as processed so WS doesn't add them again
    const processed = getProcessed(selectedDispute);
    allMessages.forEach((m) => processed.add(m.id));

    if (adminMsgs.length) {
      setAdminMessages((prev) => ({ ...prev, [selectedDispute]: adminMsgs }));
    }

    setDisputes((prev) =>
      prev.map((d) => {
        if (d.id !== selectedDispute) return d;
        // Preserve temp messages while merging confirmed ones
        const temps = d.messages.filter((m) => m.isTemp);
        return { ...d, messages: [...regularMsgs, ...temps] };
      }),
    );
  }, [refundMessagesData, selectedDispute, userId]);

  // ── Handle dispute selection ──────────────────────────────────────────────────

  useEffect(() => {
    if (!selectedDispute) return;

    const dispute = disputes.find((d) => d.id === selectedDispute);
    if (!dispute?.conversationId) return;

    joinRefundChat(dispute.conversationId);
    updateMessageStatus(dispute.conversationId);

    if ((dispute.unseen ?? 0) > 0) {
      setDisputes((prev) =>
        prev.map((d) => (d.id === selectedDispute ? { ...d, unseen: 0 } : d)),
      );
    }
  }, [selectedDispute, joinRefundChat]);

  // ── Incoming WebSocket messages ───────────────────────────────────────────────
  useEffect(() => {
    if (!lastJsonMessage) return;
    const msg = lastJsonMessage as any;
    if (msg.type !== "receiveRefundMessage") return;

    const refundId: string | undefined = msg.refundId;
    if (!refundId) return;

    // BUG FIX #1 — use per-conversation processed set
    const processed = getProcessed(refundId);
    if (processed.has(msg.id)) return;
    processed.add(msg.id);

    setDisputes((prev) => {
      const dispute = prev.find((d) => d.conversationId === refundId);
      const customerId = dispute?.customerId;

      const isOwn = msg.senderId === userId;
      const sender: Message["sender"] = isOwn
        ? "seller"
        : msg.senderId === customerId
        ? "customer"
        : "admin";

      const newMsg: Message = {
        id: msg.id || `rt-${Date.now()}`,
        senderId: msg.senderId,
        content: formatContent(msg.content ?? ""),
        imageUrl: msg.imageUrl,
        timestamp: toDisplayTime(msg.createdAt || new Date()),
        createdAt: msg.createdAt || new Date().toISOString(),
        sender,
      };

      if (sender === "admin") {
        const disputeId = dispute?.id;
        if (disputeId) {
          setAdminMessages((prev) => {
            const existing = prev[disputeId] ?? [];
            if (existing.some((m) => m.id === newMsg.id)) return prev;
            return {
              ...prev,
              [disputeId]: [...existing, newMsg].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime(),
              ),
            };
          });
        }
        return prev; // admin messages don't go into the regular list
      }

      return prev.map((d) => {
        if (d.conversationId !== refundId) return d;

        // Replace temp message if it matches (optimistic → confirmed)
        let base = d.messages;
        if (isOwn) {
          const tempIdx = base.findIndex(
            (m) =>
              m.isTemp &&
              m.content === newMsg.content &&
              m.imageUrl === newMsg.imageUrl &&
              Math.abs(
                new Date(m.createdAt).getTime() -
                  new Date(newMsg.createdAt).getTime(),
              ) < 30_000,
          );
          if (tempIdx !== -1) {
            base = [...base.slice(0, tempIdx), ...base.slice(tempIdx + 1)];
          }
        }

        if (base.some((m) => m.id === newMsg.id)) return d;

        const updated = [...base, newMsg].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

        return {
          ...d,
          messages: updated,
          unseen: d.id === selectedDispute ? 0 : (d.unseen ?? 0) + 1,
        };
      });
    });
  }, [lastJsonMessage, userId, selectedDispute]);

  // ── Auto-scroll — only when selected dispute's messages change ────────────────
  const selectedMessages = disputes.find(
    (d) => d.id === selectedDispute,
  )?.messages;
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages?.length, selectedDispute]);

  // ── File preview & auto-upload ────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      setUploadedImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    if (!selectedFile) return;

    let cancelled = false;
    const upload = async () => {
      setIsUploadingImage(true);
      const fd = new FormData();
      fd.append("file", selectedFile);
      try {
        const res = await imageUpload(fd).unwrap();
        if (!cancelled) setUploadedImageUrl(res.data);
      } catch {
        if (!cancelled) {
          toast.error("Failed to upload image");
          setSelectedFile(null);
        }
      } finally {
        if (!cancelled) setIsUploadingImage(false);
      }
    };
    upload();
    return () => {
      cancelled = true;
    };
  }, [selectedFile, imageUpload]);

  // ── Send message ──────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async () => {
    if (isSending) return;

    const dispute = disputes.find((d) => d.id === selectedDispute);
    if (!dispute) return;

    const trimmed = messageInput.trim();
    if (!trimmed && !uploadedImageUrl) return;

    if (readyState !== ReadyState.OPEN || !hasJoinedApp.current) {
      toast.error("Connection not ready. Please wait…");
      return;
    }

    setIsSending(true);

    // Optimistic message
    const now = new Date().toISOString();
    const optimistic: Message = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content: trimmed,
      imageUrl: uploadedImageUrl ?? undefined,
      timestamp: toDisplayTime(now),
      createdAt: now,
      sender: "seller",
      isTemp: true,
    };

    setDisputes((prev) =>
      prev.map((d) =>
        d.id === selectedDispute
          ? { ...d, messages: [...d.messages, optimistic] }
          : d,
      ),
    );

    sendJsonMessage({
      type: "sendRefundMessage",
      refundId: dispute.conversationId,
      receiverId: dispute.customerId,
      content: trimmed,
      ...(uploadedImageUrl ? { imageUrl: uploadedImageUrl } : {}),
    });

    setMessageInput("");
    setSelectedFile(null);
    setUploadedImageUrl(null);
    // BUG FIX #7 — reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsSending(false);
  }, [
    isSending,
    disputes,
    selectedDispute,
    messageInput,
    uploadedImageUrl,
    readyState,
    sendJsonMessage,
  ]);

  // BUG FIX #5 — onKeyPress deprecated, replaced with onKeyDown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    e.target.value = ""; // allow re-selecting same file
  };

  // ── Accept / Reject ───────────────────────────────────────────────────────────
  const applyStatus = async (newStatus: "APPROVED" | "REJECTED") => {
    const dispute = disputes.find((d) => d.id === selectedDispute);
    if (!dispute) return;

    try {
      await updateRefundStatus({
        refundId: dispute.conversationId!,
        status: newStatus,
      }).unwrap();

      const systemMsg: Message = {
        id: `system-${Date.now()}`,
        content:
          newStatus === "APPROVED"
            ? "Refund request has been accepted."
            : "Refund request has been rejected.",
        timestamp: toDisplayTime(new Date()),
        createdAt: new Date().toISOString(),
        sender: "system",
      };

      setDisputes((prev) =>
        prev.map((d) => {
          if (d.id !== selectedDispute) return d;
          const messages = [...d.messages, systemMsg].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          return {
            ...d,
            status: newStatus === "APPROVED" ? "accepted" : "rejected",
            showDefenseRequest: false,
            messages,
          };
        }),
      );
      toast.success(
        newStatus === "APPROVED" ? "Refund approved" : "Refund rejected",
      );
    } catch {
      toast.error(
        newStatus === "APPROVED"
          ? "Failed to approve refund"
          : "Failed to reject refund",
      );
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────────
  const selectedDisputeData = disputes.find((d) => d.id === selectedDispute);
  const canSend =
    (messageInput.trim().length > 0 || !!uploadedImageUrl) &&
    !isUploadingImage &&
    !isSending &&
    readyState === ReadyState.OPEN;

  const filteredConversations = searchQuery.trim()
    ? conversations.filter(
        (c) =>
          c.participants.username
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          c.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.productName?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : conversations;

  // ── Group messages by day ─────────────────────────────────────────────────────
  interface DayGroup {
    label: string;
    messages: Message[];
  }
  const groupedMessages: DayGroup[] = [];
  for (const msg of selectedDisputeData?.messages ?? []) {
    const label = dayLabel(new Date(msg.createdAt));
    const last = groupedMessages[groupedMessages.length - 1];
    if (last?.label === label) last.messages.push(msg);
    else groupedMessages.push({ label, messages: [msg] });
  }

  // ─── Auth guard ───────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: "#f8fafc" }}
      >
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Please log in to continue.
        </p>
      </div>
    );
  }

  // ─── UI ───────────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f1f5f9" }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className="w-[300px] flex flex-col flex-shrink-0 h-full border-r"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        {/* Sidebar header */}
        <div
          className="px-4 pt-5 pb-3 border-b flex-shrink-0"
          style={{ borderColor: "#e2e8f0" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "#1d4ed8" }}
            >
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-[15px] font-semibold"
              style={{ color: "#0f172a" }}
            >
              Refund Disputes
            </span>
          </div>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "#94a3b8" }}
            />
            <Input
              placeholder="Search disputes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm rounded-lg"
              style={{
                background: "#f8fafc",
                borderColor: "#e2e8f0",
                color: "#0f172a",
              }}
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          <RefundConversationList
            conversations={filteredConversations}
            isLoading={isLoading}
            selectedConversation={selectedDispute}
            onSelectConversation={setSelectedDispute}
          />
        </div>
      </aside>

      {/* ── Main panel ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {selectedDisputeData ? (
          <>
            {/* ── Chat header ── */}
            <div
              className="flex items-center gap-3 px-5 py-3.5 border-b flex-shrink-0"
              style={{ background: "#fff", borderColor: "#e2e8f0" }}
            >
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarImage
                  src={selectedDisputeData.customerAvatar}
                  alt={selectedDisputeData.customerName}
                />
                <AvatarFallback
                  className="text-xs font-bold"
                  style={{ background: "#dbeafe", color: "#1d4ed8" }}
                >
                  {getInitials(selectedDisputeData.customerName || "?")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "#0f172a" }}
                >
                  {selectedDisputeData.customerName}
                </p>
                <p className="text-xs truncate" style={{ color: "#94a3b8" }}>
                  {selectedDisputeData.product.name}{" "}
                  <span className="font-mono" style={{ color: "#f59e0b" }}>
                    #{selectedDisputeData.orderId}
                  </span>
                </p>
              </div>

              {/* Status pill */}
              {(() => {
                const cfg = STATUS_CFG[selectedDisputeData.status];
                return (
                  <div
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: cfg.bg, color: cfg.text }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: cfg.dot }}
                    />
                    {cfg.label}
                  </div>
                );
              })()}

              {/* Ticket / order meta */}
              <div
                className="hidden lg:flex flex-shrink-0 items-center gap-1 text-[11px] px-2.5 py-1 rounded-full"
                style={{ background: "#f1f5f9", color: "#64748b" }}
              >
                <span>
                  Ticket {selectedDisputeData.id.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>

            {/* ── Admin notices banner ── */}
            {adminMessages[selectedDisputeData.id]?.length > 0 && (
              <div
                className="flex-shrink-0 border-b px-5 py-3"
                style={{ background: "#0f172a", borderColor: "#1e293b" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "#94a3b8" }}
                  >
                    Admin Notices
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: "#1d4ed8", color: "#fff" }}
                  >
                    {adminMessages[selectedDisputeData.id].length}
                  </span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {adminMessages[selectedDisputeData.id].map((m) => (
                    <div
                      key={m.id}
                      className="flex items-start gap-2.5 text-sm"
                      style={{ color: "#e2e8f0" }}
                    >
                      <span
                        className="flex-shrink-0 text-[10px] font-bold mt-0.5 px-1.5 py-0.5 rounded"
                        style={{ background: "#1d4ed8", color: "#fff" }}
                      >
                        ADMIN
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="leading-snug break-words">{m.content}</p>
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: "#64748b" }}
                        >
                          {m.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Messages ── */}
            <div
              className="flex-1 overflow-y-auto px-5 py-4"
              style={{ background: "#f8fafc" }}
            >
              {selectedDisputeData.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: "#eff6ff" }}
                  >
                    <MessageSquare
                      className="w-7 h-7"
                      style={{ color: "#3b82f6" }}
                    />
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#0f172a" }}
                  >
                    No messages yet
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    Start the conversation below
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {groupedMessages.map((group) => (
                    <div key={group.label}>
                      {/* Day divider */}
                      <div className="flex items-center gap-3 my-4">
                        <div
                          className="flex-1 h-px"
                          style={{ background: "#e2e8f0" }}
                        />
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: "#94a3b8" }}
                        >
                          {group.label}
                        </span>
                        <div
                          className="flex-1 h-px"
                          style={{ background: "#e2e8f0" }}
                        />
                      </div>

                      <div className="space-y-0.5">
                        {group.messages.map((message, idx) => {
                          const prev = group.messages[idx - 1];
                          const next = group.messages[idx + 1];
                          const isFirst =
                            !prev || prev.sender !== message.sender;
                          const isLast =
                            !next || next.sender !== message.sender;
                          const isSeller = message.sender === "seller";
                          const isSystem = message.sender === "system";

                          if (isSystem) {
                            return (
                              <div
                                key={message.id}
                                className="flex justify-center my-3"
                              >
                                <span
                                  className="text-xs px-3 py-1 rounded-full"
                                  style={{
                                    background: "#f1f5f9",
                                    color: "#64748b",
                                  }}
                                >
                                  {message.content}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={message.id}
                              className={`flex items-end gap-2 ${
                                isSeller ? "justify-end" : "justify-start"
                              } ${isFirst ? "mt-3" : "mt-0.5"}`}
                            >
                              {/* Customer avatar */}
                              {!isSeller && (
                                <div className="w-7 flex-shrink-0 self-end mb-0.5">
                                  {isLast ? (
                                    <Avatar className="w-7 h-7">
                                      <AvatarImage
                                        src={selectedDisputeData.customerAvatar}
                                      />
                                      <AvatarFallback
                                        className="text-[9px] font-bold"
                                        style={{
                                          background: "#dbeafe",
                                          color: "#1d4ed8",
                                        }}
                                      >
                                        {getInitials(
                                          selectedDisputeData.customerName ||
                                            "?",
                                        )}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : null}
                                </div>
                              )}

                              {/* Bubble */}
                              <div
                                className="max-w-[62%] flex flex-col"
                                style={{
                                  alignItems: isSeller
                                    ? "flex-end"
                                    : "flex-start",
                                }}
                              >
                                {isFirst && !isSeller && (
                                  <span
                                    className="text-[11px] font-medium mb-1 ml-1"
                                    style={{ color: "#64748b" }}
                                  >
                                    {selectedDisputeData.customerName}
                                  </span>
                                )}
                                <div
                                  className="px-3.5 py-2.5 text-sm leading-relaxed"
                                  style={{
                                    background: isSeller ? "#1d4ed8" : "#fff",
                                    color: isSeller ? "#fff" : "#0f172a",
                                    border: isSeller
                                      ? "none"
                                      : "1px solid #e2e8f0",
                                    borderRadius: isSeller
                                      ? isFirst
                                        ? "18px 18px 4px 18px"
                                        : "18px 4px 4px 18px"
                                      : isFirst
                                      ? "18px 18px 18px 4px"
                                      : "4px 18px 18px 4px",
                                    boxShadow: isSeller
                                      ? "0 1px 3px rgba(29,78,216,0.2)"
                                      : "0 1px 3px rgba(0,0,0,0.07)",
                                    opacity: message.isTemp ? 0.65 : 1,
                                  }}
                                >
                                  {message.imageUrl && (
                                    <div className="mb-2 rounded-xl overflow-hidden">
                                      <Image
                                        src={message.imageUrl}
                                        alt="Attachment"
                                        width={220}
                                        height={160}
                                        className="object-cover w-full"
                                        style={{ maxHeight: 200 }}
                                        loading="lazy"
                                      />
                                    </div>
                                  )}
                                  {message.content && (
                                    <p className="whitespace-pre-wrap break-words">
                                      {message.content}
                                    </p>
                                  )}
                                  <p
                                    className="text-[10px] mt-1 text-right"
                                    style={{
                                      color: isSeller
                                        ? "rgba(255,255,255,0.6)"
                                        : "#94a3b8",
                                    }}
                                  >
                                    {message.timestamp}
                                    {message.isTemp && isSeller && " ·"}
                                  </p>
                                </div>
                              </div>

                              {/* Seller avatar spacer */}
                              {isSeller && (
                                <div className="w-7 flex-shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* ── Input / Action area ── */}
            <div
              className="flex-shrink-0 border-t"
              style={{ background: "#fff", borderColor: "#e2e8f0" }}
            >
              {/* Accept / Reject bar — only when pending defense is needed */}
              {selectedDisputeData.showDefenseRequest &&
                selectedDisputeData.status === "pending" && (
                  <div
                    className="flex items-center justify-between px-5 py-2.5 border-b"
                    style={{ background: "#fffbeb", borderColor: "#fde68a" }}
                  >
                    <p
                      className="text-xs font-medium"
                      style={{ color: "#92400e" }}
                    >
                      ⚠ Awaiting your decision on this refund
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => applyStatus("REJECTED")}
                        disabled={isUpdatingStatus}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        style={{ background: "#fee2e2", color: "#991b1b" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#fecaca")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#fee2e2")
                        }
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                      <button
                        onClick={() => applyStatus("APPROVED")}
                        disabled={isUpdatingStatus}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        style={{ background: "#dcfce7", color: "#065f46" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#bbf7d0")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#dcfce7")
                        }
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Accept
                      </button>
                    </div>
                  </div>
                )}

              {/* File preview */}
              {selectedFile && previewUrl && (
                <div
                  className="flex items-center gap-2 mx-4 mt-3 p-2 rounded-lg"
                  style={{ background: "#f1f5f9" }}
                >
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded object-cover flex-shrink-0"
                  />
                  <span
                    className="text-xs flex-1 truncate"
                    style={{ color: "#475569" }}
                  >
                    {isUploadingImage ? "Uploading…" : selectedFile.name}
                  </span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#cbd5e1" }}
                  >
                    <X className="w-3 h-3" style={{ color: "#475569" }} />
                  </button>
                </div>
              )}

              {/* Closed case notice */}
              {selectedDisputeData.status !== "pending" ? (
                <div className="px-5 py-4 flex items-center justify-center">
                  <span className="text-xs" style={{ color: "#94a3b8" }}>
                    This case is closed ·{" "}
                    {STATUS_CFG[selectedDisputeData.status].label}
                  </span>
                </div>
              ) : (
                <div className="px-4 py-3 flex items-end gap-2">
                  {/* Attach */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
                    style={{ background: "#f1f5f9", color: "#64748b" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#f1f5f9")
                    }
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Text input */}
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send)"
                    className="flex-1 h-10 text-sm rounded-2xl border px-4"
                    style={{
                      background: "#f8fafc",
                      borderColor: "#e2e8f0",
                      color: "#0f172a",
                    }}
                  />

                  {/* Send */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!canSend}
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 disabled:opacity-40"
                    style={{
                      background: canSend ? "#1d4ed8" : "#e2e8f0",
                      color: canSend ? "#fff" : "#94a3b8",
                      cursor: canSend ? "pointer" : "not-allowed",
                    }}
                    onMouseEnter={(e) => {
                      if (canSend) e.currentTarget.style.background = "#1e40af";
                    }}
                    onMouseLeave={(e) => {
                      if (canSend) e.currentTarget.style.background = "#1d4ed8";
                    }}
                  >
                    <Send
                      className="w-4 h-4"
                      style={{ transform: "translateX(1px)" }}
                    />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty state */
          <div
            className="flex-1 flex flex-col items-center justify-center"
            style={{ background: "#f8fafc" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: "#eff6ff" }}
            >
              <ShieldAlert className="w-8 h-8" style={{ color: "#3b82f6" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "#0f172a" }}>
              No dispute selected
            </p>
            <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
              Choose a refund request from the sidebar to manage it
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
