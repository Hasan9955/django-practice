// refund-request-detail.tsx
"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Paperclip, X, Image as ImageIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/Avatar/avatar";
import { Textarea } from "@/components/ui/Textarea/textarea";
import { format, isToday, isYesterday } from "date-fns";
import Image from "next/image";
import type { RefundRequest, Message } from "@/types/refund-types";

// Re-export so existing imports don't break
export type { RefundRequest, Message };

interface RefundRequestDetailProps {
  request: RefundRequest;
  messages: Message[];
  onSendMessage: (content: string, file?: File) => void;
  onStatusChange: (
    requestId: string,
    status: RefundRequest["refundStatus"],
  ) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Format a date into a readable day label */
function dayLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

/** Group messages by calendar day for date dividers */
interface GroupedMessages {
  dateKey: string;
  label: string;
  messages: Array<
    Message & { isFirstInGroup: boolean; isLastInGroup: boolean }
  >;
}

function groupMessagesByDay(messages: Message[]): GroupedMessages[] {
  const groups: GroupedMessages[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const prev = messages[i - 1];
    const next = messages[i + 1];

    const dateKey = format(msg.timestamp, "yyyy-MM-dd");
    const isFirstInGroup = !prev || prev.type !== msg.type;
    const isLastInGroup = !next || next.type !== msg.type;

    const enriched = { ...msg, isFirstInGroup, isLastInGroup };

    // Find or create day group
    const existing = groups.find((g) => g.dateKey === dateKey);
    if (existing) {
      existing.messages.push(enriched);
    } else {
      groups.push({
        dateKey,
        label: dayLabel(msg.timestamp),
        messages: [enriched],
      });
    }
  }

  return groups;
}

const STATUS_LABEL: Record<RefundRequest["refundStatus"], string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

const STATUS_STYLE: Record<
  RefundRequest["refundStatus"],
  { dot: string; text: string; bg: string }
> = {
  PENDING: { dot: "#f59e0b", text: "#92400e", bg: "#fffbeb" },
  IN_PROGRESS: { dot: "#3b82f6", text: "#1e40af", bg: "#eff6ff" },
  RESOLVED: { dot: "#10b981", text: "#065f46", bg: "#ecfdf5" },
  REJECTED: { dot: "#ef4444", text: "#991b1b", bg: "#fef2f2" },
};

// ── Component ──────────────────────────────────────────────────────────────

export function RefundRequestDetail({
  request,
  messages,
  onSendMessage,
}: RefundRequestDetailProps) {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const statusStyle = STATUS_STYLE[request.refundStatus];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate local preview for selected file
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleSend = useCallback(async () => {
    if (isSending) return;
    const trimmed = newMessage.trim();
    if (!trimmed && !selectedFile) return;

    setIsSending(true);
    try {
      await onSendMessage(trimmed, selectedFile ?? undefined);
      setNewMessage("");
      setSelectedFile(null);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  }, [isSending, newMessage, selectedFile, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    // Reset the input so the same file can be re-selected
    e.target.value = "";
  };

  const removeFile = () => setSelectedFile(null);

  const grouped = groupMessagesByDay(messages);
  const canSend =
    (newMessage.trim().length > 0 || !!selectedFile) && !isSending;

  return (
    <div className="flex flex-col h-full" style={{ background: "#f8fafc" }}>
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 border-b flex-shrink-0"
        style={{ background: "#fff", borderColor: "#e5e7eb" }}
      >
        <Avatar className="w-9 h-9 flex-shrink-0">
          <AvatarImage src={request.userAvatar} alt={request.userName} />
          <AvatarFallback
            className="text-xs font-bold"
            style={{ background: "#dbeafe", color: "#1d4ed8" }}
          >
            {getInitials(request.userName || "?")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold leading-tight truncate"
            style={{ color: "#0f172a" }}
          >
            {request.userName || "Customer"}
          </p>
          <p
            className="text-xs leading-tight truncate"
            style={{ color: "#94a3b8" }}
          >
            {request.productName}{" "}
            <span className="font-mono" style={{ color: "#f59e0b" }}>
              #{request.orderNumber}
            </span>
          </p>
        </div>

        {/* Status pill */}
        <div
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: statusStyle.bg,
            color: statusStyle.text,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: statusStyle.dot }}
          />
          {STATUS_LABEL[request.refundStatus]}
        </div>

        {/* Refund reason chip */}
        <div
          className="flex-shrink-0 hidden sm:block max-w-[180px] text-xs px-2.5 py-1 rounded-full truncate"
          style={{ background: "#f1f5f9", color: "#64748b" }}
          title={request.refundReason}
        >
          {request.refundReason}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: "#eff6ff" }}
            >
              <ImageIcon className="w-7 h-7" style={{ color: "#3b82f6" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "#0f172a" }}>
              No messages yet
            </p>
            <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
              Start the conversation below
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.dateKey}>
              {/* Date divider */}
              <div className="flex items-center gap-3 my-4">
                <div
                  className="flex-1 h-px"
                  style={{ background: "#e2e8f0" }}
                />
                <span
                  className="text-[11px] font-medium px-2"
                  style={{ color: "#94a3b8" }}
                >
                  {group.label}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "#e2e8f0" }}
                />
              </div>

              {/* Messages in this day */}
              <div className="space-y-0.5">
                {group.messages.map((message) => {
                  const isSeller = message.type === "seller";
                  const isTemp = message.id.startsWith("temp-");

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${
                        isSeller ? "justify-end" : "justify-start"
                      } ${message.isFirstInGroup ? "mt-3" : "mt-0.5"}`}
                    >
                      {/* Customer avatar — only on last bubble of group */}
                      {!isSeller && (
                        <div className="w-7 flex-shrink-0">
                          {message.isLastInGroup ? (
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={request.userAvatar} />
                              <AvatarFallback
                                className="text-[9px] font-bold"
                                style={{
                                  background: "#dbeafe",
                                  color: "#1d4ed8",
                                }}
                              >
                                {getInitials(request.userName || "?")}
                              </AvatarFallback>
                            </Avatar>
                          ) : null}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className="flex flex-col max-w-[65%]"
                        style={{
                          alignItems: isSeller ? "flex-end" : "flex-start",
                        }}
                      >
                        {/* Sender label — only first in group */}
                        {message.isFirstInGroup && !isSeller && (
                          <span
                            className="text-[11px] font-medium mb-1 ml-1"
                            style={{ color: "#64748b" }}
                          >
                            {message.senderName}
                          </span>
                        )}

                        <div
                          className="relative px-3.5 py-2.5 text-sm leading-relaxed"
                          style={{
                            background: isSeller ? "#1d4ed8" : "#fff",
                            color: isSeller ? "#fff" : "#0f172a",
                            borderRadius: isSeller
                              ? message.isFirstInGroup
                                ? "18px 18px 4px 18px"
                                : "18px 4px 4px 18px"
                              : message.isFirstInGroup
                              ? "18px 18px 18px 4px"
                              : "4px 18px 18px 4px",
                            boxShadow: isSeller
                              ? "0 1px 3px rgba(29,78,216,0.25)"
                              : "0 1px 3px rgba(0,0,0,0.08)",
                            border: isSeller ? "none" : "1px solid #e2e8f0",
                            opacity: isTemp ? 0.7 : 1,
                          }}
                        >
                          {/* Image attachment */}
                          {message.imageUrl && (
                            <div className="mb-2 rounded-xl overflow-hidden">
                              <Image
                                src={message.imageUrl}
                                alt="Attachment"
                                width={220}
                                height={160}
                                className="object-cover w-full"
                                style={{ maxHeight: 220 }}
                                loading="lazy"
                              />
                            </div>
                          )}

                          {/* Text */}
                          {message.content && (
                            <p className="whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          )}

                          {/* Timestamp row */}
                          <div
                            className="flex items-center gap-1.5 mt-1"
                            style={{ justifyContent: "flex-end" }}
                          >
                            <span
                              className="text-[10px]"
                              style={{
                                color: isSeller
                                  ? "rgba(255,255,255,0.65)"
                                  : "#94a3b8",
                              }}
                            >
                              {format(message.timestamp, "h:mm a")}
                            </span>
                            {/* Sending indicator for temp messages */}
                            {isTemp && isSeller && (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                style={{ opacity: 0.65 }}
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeDasharray="60"
                                  strokeLinecap="round"
                                >
                                  <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="0 12 12"
                                    to="360 12 12"
                                    dur="1s"
                                    repeatCount="indefinite"
                                  />
                                </circle>
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Seller avatar spacer (keeps alignment) */}
                      {isSeller && <div className="w-7 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div
        className="flex-shrink-0 border-t px-4 py-3"
        style={{ background: "#fff", borderColor: "#e5e7eb" }}
      >
        {/* File preview strip */}
        {selectedFile && previewUrl && (
          <div
            className="flex items-center gap-2 mb-2 p-2 rounded-lg"
            style={{ background: "#f1f5f9" }}
          >
            <Image
              src={previewUrl}
              alt="Preview"
              width={40}
              height={40}
              className="w-10 h-10 rounded object-cover flex-shrink-0"
            />
            <span
              className="text-xs truncate flex-1"
              style={{ color: "#475569" }}
            >
              {selectedFile.name}
            </span>
            <button
              onClick={removeFile}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "#cbd5e1" }}
            >
              <X className="w-3 h-3" style={{ color: "#475569" }} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Attach */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "#f1f5f9", color: "#64748b" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
            title="Attach image"
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
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              className="w-full resize-none text-sm leading-relaxed py-2.5 px-3.5 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              style={{
                minHeight: 42,
                maxHeight: 128,
                background: "#f8fafc",
                borderColor: "#e2e8f0",
                color: "#0f172a",
              }}
            />
          </div>

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90"
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

        <p
          className="text-[10px] mt-1.5 text-center"
          style={{ color: "#cbd5e1" }}
        >
          Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
