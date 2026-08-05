/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  KeyboardEvent,
} from "react";
import Image from "next/image";
import Avatarimg from "@/assets/images/Human.png";
import {
  Send,
  Paperclip,
  X,
  RefreshCw,
  ImageIcon,
  Loader2,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/Input/Input";
import {
  useGetConversationListQuery,
  useSingleConversationQuery,
} from "@/redux/features/messages/messagesApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { useImageUploadMutation } from "@/redux/features/logo/logoSlice";

/* ─── Types ────────────────────────────────────────────────────────────────── */

interface Message {
  id: string;
  text: string;
  timestamp: string;
  createdAt: string;
  isOwn: boolean;
  imageUrl?: string;
}

interface Participant {
  userId: string;
  username: string;
  image: string;
}

interface Conversation {
  conversationId: string;
  type: string;
  participants: Participant;
  lastMessage: string;
  lastMessageTime: string;
  unseen: number;
  messages: Message[];
}

interface WebSocketMessage {
  type: string;
  user2Id?: string;
  receiverId?: string;
  content?: string;
  imageUrl?: string;
  senderId?: string;
  timestamp?: string;
  conversationId?: string;
  message?: string;
  result?: any;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function formatTime(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isDifferentDay(a: string, b: string): boolean {
  return new Date(a).toDateString() !== new Date(b).toDateString();
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export default function MessagesPage() {
  const token = useAppSelector((state: RootState) => state.auth.access_token);
  const userId = useAppSelector((state: RootState) => state.auth.user?.id);

  /* ── API queries / mutations ─────────────────────────────────────────────── */
  const { data: conversationData, isLoading: isLoadingConversations } =
    useGetConversationListQuery({});
  const conversationsData: any[] = conversationData?.result || [];

  const [imageUpload] = useImageUploadMutation();

  /* ── State ───────────────────────────────────────────────────────────────── */
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [hasJoinedApp, setHasJoinedApp] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");

  // Image upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  /* ── Refs ────────────────────────────────────────────────────────────────── */
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const isConnecting = useRef(false);
  const currentPrivateChatUser = useRef<string | null>(null);
  // Tracks which conversations have had their API messages loaded
  const hasLoadedMessages = useRef<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * FIX: Use a ref for the incoming-message handler so the WebSocket onmessage
   * callback always calls the latest version (avoids stale-closure bugs).
   */
  const handleIncomingMessageRef = useRef<(data: WebSocketMessage) => void>(
    () => {},
  );

  /* ── Single conversation query ───────────────────────────────────────────── */
  const conversationId = activeConversation?.conversationId;
  const { data: singleConversationData, isLoading: isLoadingMessages } =
    useSingleConversationQuery(
      {
        conversationId: conversationId!,
        limit: 9999,
        page: 1,
        chatType: "PRIVATEMESSAGE",
      },
      { skip: !conversationId },
    );

  /* ── Cleanup ─────────────────────────────────────────────────────────────── */
  const cleanup = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (wsRef.current) {
      // null out handlers before closing to prevent onclose reconnect loop on unmount
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

  // Revoke object URL on change to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ── Incoming message handler ────────────────────────────────────────────── */
  const handleIncomingMessage = useCallback(
    (data: WebSocketMessage) => {
      if (!data.senderId || (!data.content && !data.imageUrl)) return;

      const isOwn = data.senderId === userId;
      // The "other" participant in this conversation
      const otherUserId = isOwn ? data.receiverId : data.senderId;

      const newMsg: Message = {
        // Use a stable ID based on sender+timestamp to aid deduplication
        id: `${data.senderId}-${data.timestamp || Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,
        text: data.content || "",
        timestamp: formatTime(data.timestamp),
        createdAt: data.timestamp || new Date().toISOString(),
        isOwn,
        imageUrl: data.imageUrl,
      };

      const updateConv = (conv: Conversation): Conversation => {
        if (conv.participants.userId !== otherUserId) return conv;
        // Deduplicate: skip if a message with the same text+isOwn arrived within 2s
        const isDup = conv.messages.some(
          (m) =>
            m.text === newMsg.text &&
            m.isOwn === newMsg.isOwn &&
            m.imageUrl === newMsg.imageUrl &&
            Math.abs(
              new Date(m.createdAt).getTime() -
                new Date(newMsg.createdAt).getTime(),
            ) < 2000,
        );
        if (isDup) return conv;
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMsg.text || "📷 Image",
          lastMessageTime: newMsg.createdAt,
          unseen: isOwn ? conv.unseen : conv.unseen + 1,
        };
      };

      setConversations((prev) => prev.map(updateConv));
      setActiveConversation((prev) => (prev ? updateConv(prev) : prev));
    },
    [userId],
  );

  // Keep the ref current so the WebSocket closure is never stale
  useEffect(() => {
    handleIncomingMessageRef.current = handleIncomingMessage;
  }, [handleIncomingMessage]);

  /* ── WebSocket connection ─────────────────────────────────────────────────── */
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
            // Always calls the latest handler via the ref — no stale closure
            handleIncomingMessageRef.current(data);
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
  }, [token, cleanup]);

  /* ── Lifecycle ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (token) connectWebSocket();
    return cleanup;
  }, [token, connectWebSocket, cleanup]);

  /* ── Join private chat ───────────────────────────────────────────────────── */
  const joinPrivateChat = useCallback(
    (user2Id: string) => {
      if (
        wsRef.current?.readyState === WebSocket.OPEN &&
        hasJoinedApp &&
        currentPrivateChatUser.current !== user2Id
      ) {
        wsRef.current.send(
          JSON.stringify({ type: "joinPrivateChat", user2Id }),
        );
        currentPrivateChatUser.current = user2Id;
      }
    },
    [hasJoinedApp],
  );

  /* ── Select conversation ─────────────────────────────────────────────────── */
  const handleConversationSelect = useCallback(
    (conv: Conversation) => {
      setActiveConversation(conv);
      // Mark unseen as cleared
      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conv.conversationId ? { ...c, unseen: 0 } : c,
        ),
      );
      joinPrivateChat(conv.participants.userId);
    },
    [joinPrivateChat],
  );

  /* ── Load API messages for selected conversation ─────────────────────────── */
  useEffect(() => {
    if (
      !singleConversationData?.result ||
      !activeConversation ||
      hasLoadedMessages.current.has(activeConversation.conversationId)
    )
      return;

    const formatted: Message[] = [...singleConversationData.result]
      .sort(
        (a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .map((msg: any) => ({
        id: msg.id || msg._id || `api-${Math.random().toString(36).slice(2)}`,
        text: msg.content || "",
        timestamp: formatTime(msg.createdAt),
        createdAt: msg.createdAt || new Date().toISOString(),
        isOwn: msg.senderId === userId,
        imageUrl: msg.imageUrl,
      }));

    hasLoadedMessages.current.add(activeConversation.conversationId);

    const merge = (conv: Conversation): Conversation => {
      if (conv.conversationId !== activeConversation.conversationId)
        return conv;
      // Keep any real-time messages that arrived before the API load finished
      const rtMessages = conv.messages.filter(
        (rt) => !formatted.some((f) => f.id === rt.id),
      );
      return { ...conv, messages: [...formatted, ...rtMessages] };
    };

    setActiveConversation((prev) => (prev ? merge(prev) : prev));
    setConversations((prev) => prev.map(merge));
  }, [singleConversationData, userId, activeConversation?.conversationId]);

  /* ── Populate conversation list from API ─────────────────────────────────── */
  useEffect(() => {
    if (!conversationsData.length) return;

    setConversations((prev) => {
      const prevMap = new Map(prev.map((c) => [c.conversationId, c]));
      return conversationsData.map((conv: any) => {
        const id = conv.conversationId || conv.id || `conv-${Date.now()}`;
        const existing = prevMap.get(id);
        return {
          conversationId: id,
          type: conv.type || "private",
          participants: conv.participants || {
            userId: conv.userId,
            username: conv.username,
            image: conv.image,
          },
          lastMessage: conv.lastMessage || "",
          lastMessageTime: conv.lastMessageTime || new Date().toISOString(),
          unseen: conv.unseen || 0,
          // FIX: preserve real-time messages already in state instead of wiping them
          messages: existing?.messages ?? [],
        };
      });
    });
  }, [conversationsData]);

  /* ── Auto-scroll ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  /* ── Image upload ────────────────────────────────────────────────────────── */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Revoke previous preview URL
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadedImageUrl("");

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("chatImage", file);
      const response = await imageUpload(formData).unwrap();
      // API returns: { success, statusCode, message, data: "<url>" }
      setUploadedImageUrl(response?.result);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Image upload failed. Please try again.");
      clearImage();
    } finally {
      setIsUploading(false);
    }

    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const clearImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadedImageUrl("");
  };

  /* ── Send message ─────────────────────────────────────────────────────────── */
  const sendMessage = useCallback(() => {
    if (!activeConversation) return;
    if (!newMessage.trim() && !uploadedImageUrl) return;
    if (connectionStatus !== "connected" || !hasJoinedApp) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    const payload: Record<string, string> = {
      type: "sendPrivateMessage",
      receiverId: activeConversation.participants.userId,
      content: newMessage.trim(),
    };

    // Include imageUrl only when an upload succeeded
    if (uploadedImageUrl) {
      payload.imageUrl = uploadedImageUrl;
    }

    wsRef.current.send(JSON.stringify(payload));
    setNewMessage("");
    clearImage();
  }, [
    activeConversation,
    newMessage,
    connectionStatus,
    hasJoinedApp,
    uploadedImageUrl,
  ]);

  /* FIX: onKeyPress is deprecated — use onKeyDown */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── Derived ─────────────────────────────────────────────────────────────── */
  const isConnected = connectionStatus === "connected";
  const canSend =
    isConnected &&
    hasJoinedApp &&
    !!activeConversation &&
    (!!newMessage.trim() || !!uploadedImageUrl) &&
    !isUploading;

  const filteredConversations = sidebarSearch
    ? conversations.filter((c) =>
        c.participants.username
          .toLowerCase()
          .includes(sidebarSearch.toLowerCase()),
      )
    : conversations;

  const statusStyles: Record<
    ConnectionStatus,
    { dot: string; text: string; label: string }
  > = {
    connected: {
      dot: "bg-emerald-400",
      text: "text-emerald-600",
      label: "Connected",
    },
    connecting: {
      dot: "bg-amber-400 animate-pulse",
      text: "text-amber-600",
      label: "Connecting…",
    },
    disconnected: {
      dot: "bg-gray-400",
      text: "text-gray-500",
      label: "Disconnected",
    },
    error: { dot: "bg-red-400", text: "text-red-600", label: "Error" },
  };
  const ss = statusStyles[connectionStatus];

  if (!token)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-700 font-semibold">Session expired</p>
          <p className="text-gray-400 text-sm">
            Please log in again to continue.
          </p>
        </div>
      </div>
    );

  /* ─── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ══ Sidebar ═══════════════════════════════════════════════════════════ */}
      <aside className="w-[320px] flex-shrink-0 flex flex-col bg-white border-r border-gray-100">
        {/* Sidebar header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-semibold text-gray-900">
              Messages
            </h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${ss.dot}`} />
              <span className={`text-[11px] font-medium ${ss.text}`}>
                {ss.label}
              </span>
              {connectionStatus !== "connected" && (
                <button
                  onClick={connectWebSocket}
                  className="ml-1 p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  title="Reconnect"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations…"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm">Loading conversations…</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Send className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-sm">
                {sidebarSearch ? "No results" : "No conversations yet"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive =
                activeConversation?.conversationId === conv.conversationId;
              return (
                <button
                  key={conv.conversationId}
                  onClick={() => handleConversationSelect(conv)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all border-b border-gray-50 hover:bg-gray-50 ${
                    isActive
                      ? "bg-blue-50 border-l-[3px] border-l-blue-500"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Image
                      src={conv.participants.image || Avatarimg}
                      alt={conv.participants.username}
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? "text-blue-700" : "text-gray-800"
                        }`}
                      >
                        {conv.participants.username}
                      </p>
                      {conv.lastMessageTime && (
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-400 truncate">
                        {conv.lastMessage || "No messages yet"}
                      </p>
                      {conv.unseen > 0 && (
                        <span className="flex-shrink-0 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1">
                          {conv.unseen > 99 ? "99+" : conv.unseen}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ══ Chat Panel ════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeConversation ? (
          <>
            {/* Chat header */}
            <header className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-100 flex-shrink-0">
              <div className="relative flex-shrink-0">
                <Image
                  src={activeConversation.participants.image || Avatarimg}
                  alt={activeConversation.participants.username}
                  width={42}
                  height={42}
                  className="w-[42px] h-[42px] rounded-full object-cover"
                />
                {isConnected && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                )}
              </div>
              <div>
                <p className="text-[15px] font-semibold text-gray-900 leading-tight">
                  {activeConversation.participants.username}
                </p>
                <p className={`text-xs font-medium ${ss.text}`}>
                  {isConnected ? "Active now" : ss.label}
                </p>
              </div>
            </header>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-1">
              {isLoadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                  <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
                  <p className="text-sm">Loading messages…</p>
                </div>
              ) : activeConversation.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 select-none">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                    <Send className="w-6 h-6 text-blue-200" />
                  </div>
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs text-gray-400">
                    Say something to get started!
                  </p>
                </div>
              ) : (
                <>
                  {activeConversation.messages.map((msg, i) => {
                    const prev = activeConversation.messages[i - 1];
                    const showDateSep =
                      i === 0 ||
                      (prev?.createdAt &&
                        isDifferentDay(prev.createdAt, msg.createdAt));

                    return (
                      <React.Fragment key={msg.id}>
                        {/* Date separator */}
                        {showDateSep && (
                          <div className="flex items-center justify-center py-3">
                            <span className="text-[11px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        {/* Bubble */}
                        <div
                          className={`flex ${
                            msg.isOwn ? "justify-end" : "justify-start"
                          } mb-0.5`}
                        >
                          {!msg.isOwn && (
                            <Image
                              src={
                                activeConversation.participants.image ||
                                Avatarimg
                              }
                              alt="avatar"
                              width={28}
                              height={28}
                              className="w-7 h-7 rounded-full object-cover self-end mr-2 mb-0.5 flex-shrink-0"
                            />
                          )}

                          <div
                            className={`max-w-xs md:max-w-sm lg:max-w-md flex flex-col ${
                              msg.isOwn ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                msg.isOwn
                                  ? "bg-blue-500 text-white rounded-br-sm"
                                  : "bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm"
                              }`}
                            >
                              {msg.imageUrl && (
                                <Image
                                  src={msg.imageUrl}
                                  alt="attachment"
                                  width={220}
                                  height={220}
                                  className="rounded-xl mb-2 w-full max-w-[220px] h-auto object-cover"
                                />
                              )}
                              {msg.text && (
                                <p className="break-words">{msg.text}</p>
                              )}
                            </div>
                            <span
                              className={`text-[10px] mt-1 px-1 ${
                                msg.isOwn ? "text-gray-400" : "text-gray-400"
                              }`}
                            >
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input bar */}
            <footer className="px-6 py-4 bg-white border-t border-gray-100 flex-shrink-0">
              {/* Image preview */}
              {selectedFile && (
                <div className="mb-3 relative inline-flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-blue-400" />
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-medium text-blue-800 max-w-[160px] truncate">
                      {selectedFile.name}
                    </p>
                    {isUploading ? (
                      <span className="flex items-center gap-1 text-[11px] text-blue-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading…
                      </span>
                    ) : uploadedImageUrl ? (
                      <span className="text-[11px] text-emerald-600 font-medium">
                        Ready to send
                      </span>
                    ) : null}
                  </div>
                  <button
                    onClick={clearImage}
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
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Attach button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isConnected || isUploading}
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Attach image"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Text input */}
                <div className="flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      !isConnected
                        ? "Waiting for connection…"
                        : "Type a message…"
                    }
                    className="rounded-full border-gray-200 bg-gray-50 px-4 focus:bg-white focus:border-blue-400 transition-colors text-sm"
                    disabled={!isConnected || !hasJoinedApp}
                  />
                </div>

                {/* Send button */}
                <button
                  type="button"
                  onClick={sendMessage}
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
            </footer>
          </>
        ) : (
          /* Empty state — no conversation selected */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400 select-none">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
              <Send className="w-9 h-9 text-blue-200" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-gray-600 mb-1">
                Your messages
              </p>
              <p className="text-sm text-gray-400">
                Select a conversation from the sidebar to start chatting.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
