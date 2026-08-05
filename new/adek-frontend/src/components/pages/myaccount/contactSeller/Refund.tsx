// src/components/pages/myaccount/contactSeller/Refund.tsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { RefundRequestModal } from "@/components/ui/Modal/refund-request-modal";
import { RefundRequestSidebar } from "./refund-request-sidebar";
import { RefundRequestDetail } from "./refund-request-detail";
import type { RefundRequest, Message } from "@/types/refund-types";

import {
  useGetAllRefundQuery,
  useGetSingleRefundMessagesQuery,
} from "@/redux/features/refund/refundApi";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useAppSelector } from "@/redux/hooks";
import type { RootState } from "@/redux/store";
import { toast } from "sonner";
import { useImageUploadMutation } from "@/redux/features/logo/logoSlice";

const WS_URL = "wss://api.sellapy.com";

// ── Helpers ────────────────────────────────────────────────────────────────
function formatContent(content: string): string {
  try {
    const parsed = JSON.parse(content);
    if (parsed.refundReason) {
      return `Refund Request Created\nReason: ${parsed.refundReason}\nProduct: ${parsed.productName}\nOrder: ${parsed.orderNumber}`;
    }
  } catch {
    // not JSON — use as-is
  }
  return content;
}

// ── Main Component (must be default export) ────────────────────────────────
export default function RefundSystemPage() {
  const xToken = useAppSelector((state: RootState) => state.auth.access_token);
  const currentUserId = useAppSelector(
    (state: RootState) => state.auth.user?.id,
  );

  /* ── WebSocket ── */
  const socketUrl = useMemo(
    () => (xToken ? `${WS_URL}?token=${encodeURIComponent(xToken)}` : null),
    [xToken],
  );

  const hasJoinedApp = useRef(false);
  const currentChatRoom = useRef<string | null>(null);

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
      share: false,
      retryOnError: true,
      onOpen: () => {
        console.log("✅ [WS] Connected");
        hasJoinedApp.current = false;
      },
      onClose: (e) => {
        console.log("⚠️ [WS] Disconnected", e.code);
        hasJoinedApp.current = false;
        currentChatRoom.current = null;
      },
      onError: (e) => console.error("❌ [WS] Error", e),
    },
    !!socketUrl,
  );

  /* Join app once per connection */
  useEffect(() => {
    if (readyState === ReadyState.OPEN && !hasJoinedApp.current) {
      sendJsonMessage({ type: "joinApp" });
      hasJoinedApp.current = true;
    }
    if (readyState === ReadyState.CLOSED) {
      hasJoinedApp.current = false;
    }
  }, [readyState, sendJsonMessage]);

  /* ── REST data ── */
  const { data: listData, isLoading } = useGetAllRefundQuery({});

  const [imageUpload] = useImageUploadMutation();

  /* ── State ── */
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* Map API list → local state */
  useEffect(() => {
    if (!listData?.result?.result) return;

    const mapped: RefundRequest[] = listData.result.result?.map(
      (item: any) => ({
        id: item.refundConversationId,
        refundReason: item.refundReason,
        refundStatus: item.refundStatus as RefundRequest["refundStatus"],
        productName: item.productName,
        productImage: item.productImage,
        orderNumber: item.orderNumber,
        userId: item.participants.userId,
        userName: item.participants.username,
        userAvatar: item.participants.image,
        createdAt: new Date(item.lastMessageTime || Date.now()),
        lastMessage: item.lastMessage || "",
        lastMessageTime: item.lastMessageTime,
        unseen: item.unseen,
      }),
    );

    setRefundRequests(mapped);
  }, [listData]);

  /* Auto-select first request */
  useEffect(() => {
    if (refundRequests.length > 0 && !selectedRequestId) {
      setSelectedRequestId(refundRequests[0].id);
    }
  }, [refundRequests]);

  /* ── Selected request ── */
  const selectedRequest = refundRequests.find(
    (r) => r.id === selectedRequestId,
  );

  /* ── Load messages for selected conversation ── */
  const { data: refundMessagesData } = useGetSingleRefundMessagesQuery(
    selectedRequestId ? { refundConversationId: selectedRequestId } : skipToken,
  );

  useEffect(() => {
    if (!selectedRequestId || !refundMessagesData?.result) return;

    const apiMessages: Message[] = refundMessagesData.result
      .map((m: any) => {
        const isFromCurrentUser = m.senderId === currentUserId;
        return {
          id: m.id,
          senderId: m.senderId,
          senderName: isFromCurrentUser
            ? "You"
            : selectedRequest?.userName ?? "Customer",
          content: formatContent(m.content),
          imageUrl: m.imageUrl || undefined,
          timestamp: new Date(m.createdAt),
          type: isFromCurrentUser ? "seller" : "customer",
        } as Message;
      })
      .sort(
        (a: Message, b: Message) =>
          a.timestamp.getTime() - b.timestamp.getTime(),
      );

    setMessages((prev) => {
      const existing = prev[selectedRequestId] ?? [];
      const realCount = existing.filter(
        (m) => !m.id.startsWith("temp-"),
      ).length;
      if (realCount >= apiMessages.length) return prev;

      const tempMessages = existing.filter((m) => m.id.startsWith("temp-"));
      return {
        ...prev,
        [selectedRequestId]: [...apiMessages, ...tempMessages],
      };
    });
  }, [
    refundMessagesData,
    selectedRequestId,
    selectedRequest?.userName,
    currentUserId,
  ]);

  /* ── Join chat room on select ── */
  useEffect(() => {
    if (
      selectedRequestId &&
      readyState === ReadyState.OPEN &&
      hasJoinedApp.current &&
      currentChatRoom.current !== selectedRequestId
    ) {
      sendJsonMessage({ type: "joinRefundChat", refundId: selectedRequestId });
      currentChatRoom.current = selectedRequestId;
    }
  }, [selectedRequestId, readyState, sendJsonMessage]);

  /* ── Real-time WebSocket messages ── */
  useEffect(() => {
    if (!lastJsonMessage) return;
    const msg = lastJsonMessage as any;

    if (msg.type !== "receiveRefundMessage") return;

    const refundId: string | undefined = msg.refundId;
    if (!refundId) {
      console.warn("⚠️ [WS] receiveRefundMessage missing refundId");
      return;
    }

    const isFromCurrentUser = msg.senderId === currentUserId;
    const relatedRequest = refundRequests.find((r) => r.id === refundId);

    const newMsg: Message = {
      id: msg.id || `${refundId}-${Date.now()}`,
      senderId: msg.senderId,
      senderName: isFromCurrentUser
        ? "You"
        : relatedRequest?.userName ?? "Customer",
      content: formatContent(msg.content ?? ""),
      imageUrl: msg.imageUrl || undefined,
      timestamp: new Date(msg.createdAt || Date.now()),
      type: isFromCurrentUser ? "seller" : "customer",
    };

    setMessages((prev) => {
      const existing = prev[refundId] ?? [];
      if (existing.some((m) => m.id === newMsg.id)) return prev;

      let base = existing;
      if (isFromCurrentUser) {
        const newMsgMs = newMsg.timestamp.getTime();
        const tempIdx = existing.findIndex(
          (m) =>
            m.id.startsWith("temp-") &&
            m.content === newMsg.content &&
            m.imageUrl === newMsg.imageUrl &&
            Math.abs(m.timestamp.getTime() - newMsgMs) < 30_000,
        );
        if (tempIdx !== -1) {
          base = [
            ...existing.slice(0, tempIdx),
            ...existing.slice(tempIdx + 1),
          ];
        }
      }

      const updated = [...base, newMsg].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      );

      return { ...prev, [refundId]: updated };
    });

    setRefundRequests((prev) =>
      prev.map((r) =>
        r.id === refundId
          ? {
              ...r,
              lastMessage: msg.content,
              lastMessageTime: new Date().toISOString(),
              unseen: r.id === selectedRequestId ? 0 : (r.unseen ?? 0) + 1,
            }
          : r,
      ),
    );
  }, [lastJsonMessage, selectedRequestId, currentUserId, refundRequests]);

  /* ── Send message ── */
  const handleSendMessage = useCallback(
    async (content: string, file?: File): Promise<void> => {
      if (!selectedRequestId || (!content.trim() && !file) || !selectedRequest)
        return;

      if (readyState !== ReadyState.OPEN) {
        toast.error("Connection lost. Please wait for reconnect…");
        return;
      }

      let imageUrl: string | undefined;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          const res = await imageUpload(formData).unwrap();
          imageUrl = res.data;
        } catch {
          toast.error("Failed to upload image. Please try again.");
          return;
        }
      }

      const messageContent = content.trim();

      const optimistic: Message = {
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        senderId: currentUserId || "current-user",
        senderName: "You",
        content: messageContent,
        imageUrl,
        timestamp: new Date(),
        type: "seller",
      };

      setMessages((prev) => ({
        ...prev,
        [selectedRequestId]: [...(prev[selectedRequestId] ?? []), optimistic],
      }));

      setRefundRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequestId
            ? {
                ...r,
                lastMessage: messageContent,
                lastMessageTime: new Date().toISOString(),
              }
            : r,
        ),
      );

      sendJsonMessage({
        type: "sendRefundMessage",
        refundId: selectedRequestId,
        receiverId: selectedRequest.userId,
        content: messageContent,
        ...(imageUrl ? { imageUrl } : {}),
      });
    },
    [
      selectedRequestId,
      selectedRequest,
      sendJsonMessage,
      currentUserId,
      readyState,
      imageUpload,
    ],
  );

  /* ── Status change ── */
  const handleStatusChange = useCallback(
    (requestId: string, newStatus: RefundRequest["refundStatus"]) => {
      setRefundRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, refundStatus: newStatus } : r,
        ),
      );
    },
    [],
  );

  /* ── Loading / auth guards ── */
  if (isLoading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: "#f8fafc" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-t-blue-600 border-blue-100 animate-spin mx-auto mb-3" />
          <p className="text-sm" style={{ color: "#64748b" }}>
            Loading refund requests…
          </p>
        </div>
      </div>
    );
  }

  if (!xToken) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: "#f8fafc" }}
      >
        <div
          className="border rounded-2xl p-8 max-w-sm text-center"
          style={{ background: "#fff", borderColor: "#fecaca" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: "#fee2e2" }}
          >
            <span className="text-xl">🔒</span>
          </div>
          <h3 className="font-semibold mb-1" style={{ color: "#0f172a" }}>
            Authentication Required
          </h3>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Please log in to access refund requests.
          </p>
        </div>
      </div>
    );
  }

  /* ── Main layout ── */
  return (
    <div className="flex h-screen" style={{ background: "#f8fafc" }}>
      {/* Sidebar */}
      <RefundRequestSidebar
        requests={refundRequests}
        selectedRequestId={selectedRequestId}
        onSelectRequest={(id) => {
          setSelectedRequestId(id);
          setRefundRequests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, unseen: 0 } : r)),
          );
        }}
        onAddNewRequest={() => setIsModalOpen(true)}
      />

      {/* Chat panel */}
      <div className="flex-1 min-w-0">
        {selectedRequest ? (
          <RefundRequestDetail
            request={selectedRequest}
            messages={messages[selectedRequestId] ?? []}
            onSendMessage={handleSendMessage}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="flex h-full items-center justify-center flex-col gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "#eff6ff" }}
            >
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-sm font-medium" style={{ color: "#64748b" }}>
              Select a refund request to view the conversation
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <RefundRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefundCreated={(newRequest) => {
          setRefundRequests((prev) => [newRequest, ...prev]);
          setMessages((prev) => ({ ...prev, [newRequest.id]: [] }));
          setSelectedRequestId(newRequest.id);
        }}
      />
    </div>
  );
}
