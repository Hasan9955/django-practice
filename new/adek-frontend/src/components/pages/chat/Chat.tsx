/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import Image, { StaticImageData } from "next/image";
import { Send, Paperclip, X, WifiOff, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { usePathname } from "next/navigation";
import { useImageUploadMutation } from "@/redux/features/logo/logoSlice";
import { TiArrowBack } from "react-icons/ti";

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: string;
  /** URL of a shared image (from server) */
  imageUrl?: string;
}

interface ChatInterfaceProps {
  contactName: string;
  contactAvatar: string | StaticImageData;
  /** Avatar for the logged-in user — shown on user-side bubbles */
  userAvatar?: string | StaticImageData;
  isOnline: boolean;
  onClose: () => void;
  token: string;
}

interface WebSocketMessage {
  type: string;
  content?: string;
  senderId?: string;
  receiverId?: string;
  imageUrl?: string;
  timestamp?: string;
  message?: string;
  _id?: string;
  messageId?: string;
  roomId?: string;
  conversations?: any[];
  isTyping?: boolean;
  userId?: string;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/** Format a Date (or ISO string) to HH:MM */
function formatTime(ts?: string): string {
  const date = ts ? new Date(ts) : new Date();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function ChatInterface({
  contactName,
  contactAvatar,
  userAvatar,
  isOnline,
  onClose,
  token,
}: ChatInterfaceProps) {
  const path = usePathname();
  const user2Id = path.split("/")[3];

  /* state */
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  /** Local object-URL used for image preview before upload completes */
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [hasJoinedApp, setHasJoinedApp] = useState(false);
  /** Confirmed server URL of the uploaded image */
  const [imageUrl, setImageUrl] = useState<string>("");

  /* refs */
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isConnecting = useRef(false);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const currentPrivateChatUser = useRef<string | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const isEmittingTyping = useRef(false);

  /* RTK mutation */
  const [imageUpload] = useImageUploadMutation();

  /* ── Cleanup ──────────────────────────────────────────────────────────── */

  const cleanup = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, "Component unmounting");
      }
      wsRef.current = null;
    }
    isConnecting.current = false;
  }, []);

  /* Revoke object-URLs when they change to avoid memory leaks */
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ── Incoming message handler ─────────────────────────────────────────── */

  const handleIncomingMessage = useCallback(
    (data: WebSocketMessage) => {
      const isFromOther = data.senderId === user2Id;

      const newMsg: Message = {
        id: data._id || data.messageId || `${Date.now()}-${Math.random()}`,
        text: data.content || data.message || "",
        // FIX: properly distinguish who sent the message
        sender: isFromOther ? "other" : "user",
        timestamp: formatTime(data.timestamp),
        imageUrl: data.imageUrl,
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev; // deduplicate
        return [...prev, newMsg];
      });
    },
    [user2Id],
  );

  /* ── WebSocket connection ─────────────────────────────────────────────── */

  const connectWebSocket = useCallback(() => {
    if (!token) {
      setConnectionStatus("error");
      return;
    }
    if (isConnecting.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    isConnecting.current = true;
    cleanup();
    setConnectionStatus("connecting");

    const ws = new WebSocket(
      `wss://api.sellapy.com?token=${encodeURIComponent(token)}`,
    );

    ws.onopen = () => {
      setConnectionStatus("connected");
      reconnectAttempts.current = 0;
      isConnecting.current = false;
      ws.send(JSON.stringify({ type: "joinApp" }));
      setHasJoinedApp(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        switch (data.type) {
          case "receivePrivateMessage":
            handleIncomingMessage(data);
            break;

          case "typing":
            setIsTyping(data.isTyping === true && data.userId === user2Id);
            break;

          case "error":
            console.error("WS server error:", data.message);
            break;

          default:
            break;
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    ws.onclose = (event) => {
      setConnectionStatus("disconnected");
      setHasJoinedApp(false);
      isConnecting.current = false;
      currentPrivateChatUser.current = null;

      if (event.code !== 1000 && reconnectAttempts.current < 5) {
        const delay = Math.min(3000 * (reconnectAttempts.current + 1), 15000);
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connectWebSocket();
        }, delay);
      }
    };

    ws.onerror = () => {
      setConnectionStatus("error");
      isConnecting.current = false;
    };

    wsRef.current = ws;
  }, [token, cleanup, handleIncomingMessage, user2Id]);

  /* ── Lifecycle ────────────────────────────────────────────────────────── */

  useEffect(() => {
    connectWebSocket();
    return cleanup;
  }, [connectWebSocket, cleanup]);

  const joinPrivateChat = useCallback(
    (uid: string) => {
      if (
        wsRef.current?.readyState === WebSocket.OPEN &&
        hasJoinedApp &&
        currentPrivateChatUser.current !== uid
      ) {
        wsRef.current.send(
          JSON.stringify({ type: "joinPrivateChat", user2Id: uid }),
        );
        currentPrivateChatUser.current = uid;
      }
    },
    [hasJoinedApp],
  );

  useEffect(() => {
    if (connectionStatus === "connected" && hasJoinedApp && user2Id) {
      joinPrivateChat(user2Id);
    }
  }, [connectionStatus, hasJoinedApp, user2Id, joinPrivateChat]);

  /* Scroll to bottom on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ── Typing indicator emission ───────────────────────────────────────── */

  const sendTypingEvent = useCallback(
    (typing: boolean) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "typing",
            receiverId: user2Id,
            isTyping: typing,
          }),
        );
      }
    },
    [user2Id],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Emit typing:true once per burst, then debounce typing:false
    if (!isEmittingTyping.current) {
      isEmittingTyping.current = true;
      sendTypingEvent(true);
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      isEmittingTyping.current = false;
      sendTypingEvent(false);
    }, 1500);
  };

  /* ── Send message ─────────────────────────────────────────────────────── */

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !imageUrl) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    // Stop typing indicator
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (isEmittingTyping.current) {
      isEmittingTyping.current = false;
      sendTypingEvent(false);
    }

    const payload: Record<string, string> = {
      type: "sendPrivateMessage",
      receiverId: user2Id,
      content: newMessage.trim(),
    };
    if (imageUrl) payload.imageUrl = imageUrl;

    wsRef.current.send(JSON.stringify(payload));

    setNewMessage("");
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setImageUrl("");
  };

  /* FIX: use onKeyDown — onKeyPress is deprecated */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* ── File / image upload ─────────────────────────────────────────────── */

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("chatImage", file);
      const response = await imageUpload(formData).unwrap();
      const url: string = response?.result;
      setImageUrl(url);
      return url;
    } catch (err) {
      console.error("Image upload failed:", err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Revoke old preview URL before creating a new one
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file)); // instant local preview
    await uploadImage(file);

    // Reset the input so the same file can be re-selected if needed
    e.target.value = "";
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setImageUrl("");
  };

  /* ── Connection status helpers ───────────────────────────────────────── */

  const statusConfig: Record<
    ConnectionStatus,
    { label: string; color: string; dot: string }
  > = {
    connecting: {
      label: "Connecting…",
      color: "text-amber-500",
      dot: "bg-amber-400",
    },
    connected: {
      label: "Connected",
      color: "text-emerald-600",
      dot: "bg-emerald-400",
    },
    disconnected: {
      label: "Disconnected",
      color: "text-gray-400",
      dot: "bg-gray-300",
    },
    error: { label: "Error", color: "text-red-500", dot: "bg-red-400" },
  };

  const {
    label: statusLabel,
    color: statusColor,
    dot: statusDot,
  } = statusConfig[connectionStatus];

  const isDisabled = isUploading || connectionStatus !== "connected";
  const canSend = (!!newMessage.trim() || !!imageUrl) && !isDisabled;

  /* ─── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="container pt-8 lg:px-16 md:px-1 sm:px-10 px-6 xl:px-0 mx-auto">
      <div className="flex  flex-col overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            {/* Avatar + online dot */}
            <div className="relative flex-shrink-0">
              <Image
                src={contactAvatar}
                alt={contactName}
                width={42}
                height={42}
                className="rounded-full w-[42px] h-[42px] object-cover ring-2 ring-white"
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white" />
              )}
            </div>

            <div>
              <h3 className="font-semibold text-[15px] text-gray-900 leading-tight">
                {contactName}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                <p className={`text-[11px] font-medium ${statusColor}`}>
                  {connectionStatus === "connected"
                    ? isOnline
                      ? "Active now"
                      : "Offline"
                    : statusLabel}
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <TiArrowBack className="w-5 h-5 text-blue-400" />
          </Button>
        </div>

        {/* ── Messages ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[65vh] max-h-[75vh] bg-gray-50/50">
          {/* Empty state */}
          {messages.length === 0 && connectionStatus === "connected" && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 select-none py-16">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Send className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm">No messages yet — say hello!</p>
            </div>
          )}

          {/* Disconnected / error notice */}
          {connectionStatus !== "connected" && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 py-16">
              <WifiOff className="w-8 h-8 text-gray-300" />
              <p className="text-sm">{statusLabel}</p>
              {connectionStatus === "disconnected" && (
                <button
                  onClick={connectWebSocket}
                  className="text-xs text-blue-500 underline underline-offset-2"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Message list */}
          {messages.map((message) => {
            const isUser = message.sender === "user";

            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-end gap-2 max-w-[72%] ${
                    isUser ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar — only for "other" side */}
                  {!isUser && (
                    <Image
                      src={contactAvatar}
                      alt={contactName}
                      width={28}
                      height={28}
                      className="rounded-full flex-shrink-0 w-7 h-7 object-cover self-end mb-4"
                    />
                  )}

                  {/* User's own avatar (optional) */}
                  {isUser && userAvatar && (
                    <Image
                      src={userAvatar}
                      alt="You"
                      width={28}
                      height={28}
                      className="rounded-full flex-shrink-0 w-7 h-7 object-cover self-end mb-4"
                    />
                  )}

                  <div
                    className={`flex flex-col ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-full ${
                        isUser
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm"
                      }`}
                    >
                      {message.imageUrl && (
                        <Image
                          src={message.imageUrl}
                          alt="Shared image"
                          width={220}
                          height={220}
                          className="rounded-xl mb-2 max-w-[220px] w-full h-auto object-cover"
                        />
                      )}
                      {message.text && <p>{message.text}</p>}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2 max-w-[72%]">
                <Image
                  src={contactAvatar}
                  alt={contactName}
                  width={28}
                  height={28}
                  className="rounded-full flex-shrink-0 w-7 h-7 object-cover"
                />
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex space-x-1 items-center h-3">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input bar ────────────────────────────────────────────────── */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          {/* Image preview */}
          {selectedFile && (
            <div className="mb-3 relative inline-flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-2">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-blue-400" />
                </div>
              )}
              <div className="flex flex-col justify-between h-16">
                <p className="text-xs text-blue-700 font-medium max-w-[140px] truncate">
                  {selectedFile.name}
                </p>
                {isUploading && (
                  <div className="flex items-center gap-1 text-[11px] text-blue-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Uploading…
                  </div>
                )}
                {!isUploading && imageUrl && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    Ready to send
                  </p>
                )}
              </div>
              <button
                onClick={clearSelectedFile}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center"
                aria-label="Remove image"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isDisabled}
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Attach image"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Text input */}
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  connectionStatus !== "connected"
                    ? "Waiting for connection…"
                    : "Type a message…"
                }
                className="rounded-full border-gray-200 bg-gray-50 px-4 focus:bg-white focus:border-blue-400 transition-colors text-sm"
                disabled={isDisabled}
                aria-label="Message input"
              />
            </div>

            {/* Send button */}
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!canSend}
              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                canSend
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md active:scale-95"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
              aria-label="Send message"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
