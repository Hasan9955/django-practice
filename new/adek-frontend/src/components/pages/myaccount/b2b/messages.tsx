/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
  KeyboardEvent,
} from "react";
import {
  Send,
  RefreshCw,
  Paperclip,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Calendar,
  DollarSign,
  Hash,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { TiArrowBack } from "react-icons/ti";
import { useSingleConversationQuery } from "@/redux/features/messages/messagesApi";
import { useImageUploadMutation } from "@/redux/features/logo/logoSlice";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import {
  useGetSellerB2BConversationsListQuery,
  useUpdateB2BOfferStatusMutation,
} from "@/redux/features/dashborad/b2bProtal/b2bProtalApi";
import { useGetOtherProfileQuery } from "@/redux/features/auth/authApi";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OfferItem {
  id: string;
  productId: string;
  offerId: string;
  unitPrice: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface OfferData {
  id: string;
  conversationId: string;
  offerStuts: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
  isDelivered: boolean;
  buyerId: string;
  sellerId: string;
  expectedDeliveryDate: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  offer_Items: OfferItem[];
}

interface TextMessage {
  id: string;
  type: "text" | "offer" | "image";
  sender: "buyer" | "seller";
  content: string;
  offerData?: OfferData;
  imageUrl?: string;
  timestamp: string;
  createdAt: string;
}

type Message = TextMessage;

interface Conversation {
  id: string;
  buyerUserId: string;
  seller: string;
  product: string;
  orderNumber: string;
  time: string;
  avatar: string;
  unreadCount: number;
  messages: Message[];
  email: string;
}

interface WsMsg {
  type: string;
  senderId?: string;
  receiverId?: string;
  content?: unknown;
  imageUrl?: string;
  timestamp?: string;
  message?: unknown;
  _id?: string;
  messageId?: string;
  isTyping?: boolean;
  userId?: string;
  messageType?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractStringContent(value: unknown): string {
  if (typeof value === "string") return value;
  return "";
}

// BUG-B1 FIX: unified offer parser used by both API and WS paths
function tryParseOffer(content: unknown): OfferData | null {
  if (!content) return null;

  if (typeof content === "object" && content !== null) {
    const obj = content as Record<string, unknown>;
    // Shape: { offerId, offerData: { ... } }
    if (obj.offerData) {
      const offer = obj.offerData as any;
      if (offer?.id && offer?.offerStuts && offer?.offer_Items) {
        return offer as OfferData;
      }
    }
    // Direct offer object
    if (obj.id && obj.offerStuts && obj.offer_Items) {
      return content as OfferData;
    }
    return null;
  }

  if (typeof content === "string") {
    if (!content.trim().startsWith("{")) return null;
    try {
      const parsed = JSON.parse(content);
      if (parsed?.id && parsed?.offerStuts && parsed?.offer_Items)
        return parsed as OfferData;
      if (parsed?.offerData) {
        const offer = parsed.offerData;
        if (offer?.id && offer?.offerStuts && offer?.offer_Items)
          return offer as OfferData;
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

// BUG-B1 FIX: formatApiMessages now detects offers by BOTH messageType="OFFER"
// AND by content being an offer-shaped object (covers messageType="PRIVATEMESSAGE"
// messages that the backend still sends with offer content — confirmed in API data).
// Also falls back to msg.chatType for legacy messages that lack messageType.
function formatApiMessages(
  rawList: any[],
  currentUserId: string | undefined,
): TextMessage[] {
  return [...rawList]
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((msg: any, index: number) => {
      // BUG-B1a: prefer messageType, fall back to chatType (older messages)
      const msgType: string = msg.messageType || msg.chatType || "B2B";

      // BUG-B1b: detect offers by explicit type OR by content being an object
      const contentIsObject =
        typeof msg.content === "object" && msg.content !== null;
      const isOffer = msgType === "OFFER" || contentIsObject;

      let offerData: OfferData | undefined;
      let resolvedType: "text" | "offer" | "image" = "text";
      let textContent = "";

      if (isOffer) {
        const parsed = tryParseOffer(msg.content);
        if (parsed) {
          offerData = parsed;
          resolvedType = "offer";
        }
      }

      if (resolvedType === "text") {
        textContent = typeof msg.content === "string" ? msg.content : "";
        if (msg.imageUrl && !textContent) resolvedType = "image";
      }

      // BUG-B8 FIX: deterministic stable ID — no more Date.now()+Math.random()
      const stableId =
        msg.id ||
        msg._id ||
        `msg-${msg.createdAt || "no-date"}-${
          msg.senderId || "no-sender"
        }-${index}`;

      return {
        id: stableId,
        type: resolvedType,
        sender: msg.senderId === currentUserId ? "seller" : "buyer",
        content: resolvedType === "offer" ? "" : textContent,
        offerData,
        imageUrl: msg.imageUrl || undefined,
        timestamp: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        createdAt: msg.createdAt || new Date().toISOString(),
      };
    });
}

// ─── OfferCard ────────────────────────────────────────────────────────────────
function OfferCard({
  offer,
  sender,
  onUpdateStatus,
}: {
  offer: OfferData;
  sender: "buyer" | "seller";
  onUpdateStatus?: (offerId: string, status: "ACCEPTED" | "REJECTED") => void;
}) {
  const isSeller = sender === "seller";
  const statusColor =
    offer.offerStuts === "ACCEPTED"
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : offer.offerStuts === "REJECTED"
      ? "text-red-600 bg-red-50 border-red-200"
      : offer.offerStuts === "COMPLETED"
      ? "text-blue-600 bg-blue-50 border-blue-200"
      : "text-amber-600 bg-amber-50 border-amber-200";

  const statusIcon =
    offer.offerStuts === "ACCEPTED" || offer.offerStuts === "COMPLETED" ? (
      <CheckCircle className="w-3.5 h-3.5" />
    ) : offer.offerStuts === "REJECTED" ? (
      <XCircle className="w-3.5 h-3.5" />
    ) : (
      <Clock className="w-3.5 h-3.5" />
    );

  const canAct = !isSeller && offer.offerStuts === "PENDING" && onUpdateStatus;

  return (
    <div className="w-[300px] rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-200" />
          <span className="text-white text-sm font-semibold tracking-wide">
            B2B Offer
          </span>
        </div>
        <span
          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}
        >
          {statusIcon}
          {offer.offerStuts}
        </span>
      </div>

      <div className="px-4 py-3 space-y-3">
        {offer.offer_Items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-mono truncate max-w-[100px]">
                {item.productId.slice(-8)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <span className="font-semibold">
                ×{item.quantity.toLocaleString()}
              </span>
              <span className="text-slate-400">@</span>
              <span className="font-semibold text-blue-600">
                ${item.unitPrice.toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs">
              {new Date(offer.expectedDeliveryDate).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                },
              )}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-sm font-bold text-slate-800">
              {offer.totalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {canAct && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onUpdateStatus!(offer.id, "ACCEPTED")}
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Accept
            </button>
            <button
              onClick={() => onUpdateStatus!(offer.id, "REJECTED")}
              className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        )}

        {!canAct && !isSeller && offer.offerStuts !== "PENDING" && (
          <p className="text-center text-xs text-slate-400 pt-1">
            Offer has been {offer.offerStuts.toLowerCase()}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── DirectChat ───────────────────────────────────────────────────────────────
// BUG-B2 FIX: replaced the two competing scroll useEffects with a single
//             coordinated system using justPrepended + skipNextScroll refs
//             (same pattern used in the seller component).
// BUG-B3 FIX: removed isFetchingMore from pagination useEffect deps.
// BUG-B8 FIX: stable message IDs in WS handler.
function DirectChat({
  user2Id,
  token,
  userId,
  conv,
}: {
  user2Id: string;
  productId: string | null;
  token: string;
  userId: string | undefined;
  conv: Conversation | null;
}) {
  const router = useRouter();
  const { data: user, isLoading } = useGetOtherProfileQuery(user2Id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [hasJoinedApp, setHasJoinedApp] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const LIMIT = 20;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isConnecting = useRef(false);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const currentPrivateChatUser = useRef<string | null>(null);
  const prevScrollHeight = useRef<number>(0);

  const [imageUpload] = useImageUploadMutation();
  const [updateOfferStatus] = useUpdateB2BOfferStatusMutation();

  const { data: historyData, isLoading: historyLoading } =
    useSingleConversationQuery(
      { conversationId: conv?.id ?? "", limit: LIMIT, page, chatType: "B2B" },
      { skip: !conv?.id },
    );

  // Initial page load
  useEffect(() => {
    if (!historyData?.result || historyLoaded) return;
    const formatted = formatApiMessages(historyData.result, userId);
    setMessages(formatted);
    setHistoryLoaded(true);
    if (historyData.result.length < LIMIT) setHasMore(false);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 50);
  }, [historyData, historyLoaded, userId]);

  // Paginated older messages
  useEffect(() => {
    if (!isFetchingMore || !historyData?.result) return;
    const formatted = formatApiMessages(historyData.result, userId);
    if (formatted.length < LIMIT) setHasMore(false);
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const older = formatted.filter((m) => !existingIds.has(m.id));
      if (older.length === 0) return prev;
      return [...older, ...prev];
    });
    setIsFetchingMore(false);
  }, [historyData, isFetchingMore]);

  // Restore scroll position after prepend
  useEffect(() => {
    if (!isFetchingMore && messagesContainerRef.current) {
      const newHeight = messagesContainerRef.current.scrollHeight;
      messagesContainerRef.current.scrollTop =
        newHeight - prevScrollHeight.current;
    }
  }, [messages.length]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (!isFetchingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScrollTop = useCallback(() => {
    if (
      !messagesContainerRef.current ||
      !hasMore ||
      isFetchingMore ||
      !historyLoaded
    )
      return;
    if (messagesContainerRef.current.scrollTop < 80) {
      prevScrollHeight.current = messagesContainerRef.current.scrollHeight;
      setPage((p) => p + 1);
      setIsFetchingMore(true);
    }
  }, [hasMore, isFetchingMore, historyLoaded]);

  const handleIncomingMessage = useCallback(
    (data: WsMsg) => {
      const offerData = tryParseOffer(data.content);

      // FIX: Guard content — never pass a non-string object into JSX
      const textContent = offerData
        ? ""
        : extractStringContent(data.content) ||
          extractStringContent(data.message);

      const newMsg: Message = {
        id: data._id || data.messageId || `${Date.now()}-${Math.random()}`,
        type: offerData ? "offer" : "text",
        sender: data.senderId === user2Id ? "buyer" : "seller",
        content: textContent,
        offerData: offerData ?? undefined,
        imageUrl: data.imageUrl,
        timestamp: data.timestamp
          ? new Date(data.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
        createdAt: data.timestamp || new Date().toISOString(),
      };
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    },
    [user2Id],
  );

  const connectWebSocket = useCallback(() => {
    if (!token) {
      setConnectionStatus("error");
      return;
    }
    if (isConnecting.current || wsRef.current?.readyState === WebSocket.OPEN)
      return;

    isConnecting.current = true;
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
        const data: WsMsg = JSON.parse(event.data);
        switch (data.type) {
          case "receivePrivateMessage":
            handleIncomingMessage(data);
            break;
          case "typing":
            setIsTyping(data.isTyping === true && data.userId === user2Id);
            break;
          case "error":
            console.error("WS error:", data.message);
            break;
        }
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onclose = (event) => {
      setConnectionStatus("disconnected");
      setHasJoinedApp(false);
      isConnecting.current = false;
      currentPrivateChatUser.current = null;
      if (event.code !== 1000 && reconnectAttempts.current < 5) {
        const delay = 3000 * (reconnectAttempts.current + 1);
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
  }, [token, handleIncomingMessage, user2Id]);

  const joinPrivateChat = useCallback(
    (uid: string) => {
      if (
        wsRef.current?.readyState === WebSocket.OPEN &&
        hasJoinedApp &&
        currentPrivateChatUser.current !== uid
      ) {
        wsRef.current.send(
          JSON.stringify({
            type: "joinPrivateChat",
            user2Id: uid,
            chatType: "B2B",
          }),
        );
        currentPrivateChatUser.current = uid;
      }
    },
    [hasJoinedApp],
  );

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  useEffect(() => {
    if (connectionStatus === "connected" && hasJoinedApp && user2Id) {
      joinPrivateChat(user2Id);
    }
  }, [connectionStatus, hasJoinedApp, user2Id, joinPrivateChat]);

  const uploadImage = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("chatImage", file);
      const response = await imageUpload(formData).unwrap();
      setImageUrl(response?.result);
      return response?.result;
    } catch (e) {
      console.error("Upload failed:", e);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    setSelectedFile(file);
    await uploadImage(file);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !imageUrl) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    const payload: Record<string, string> = {
      type: "sendPrivateMessage",
      receiverId: user2Id,
      content: newMessage.trim(),
      chatType: "B2B",
    };
    if (imageUrl) payload.imageUrl = imageUrl;
    wsRef.current.send(JSON.stringify(payload));
    setNewMessage("");
    setSelectedFile(null);
    setImageUrl("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOfferUpdate = async (
    offerId: string,
    offerStatus: "ACCEPTED" | "REJECTED",
  ) => {
    try {
      await updateOfferStatus({ offerId, offerStatus }).unwrap();
      setMessages((prev) =>
        prev.map((m) => {
          if (m.type === "offer" && m.offerData?.id === offerId) {
            return {
              ...m,
              offerData: { ...m.offerData!, offerStuts: offerStatus },
            };
          }
          return m;
        }),
      );
    } catch (e) {
      console.error("Offer update failed:", e);
    }
  };

  const statusDot =
    connectionStatus === "connected"
      ? "bg-emerald-500"
      : connectionStatus === "connecting"
      ? "bg-amber-400 animate-pulse"
      : "bg-red-500";

  const displayName = user?.result?.fullName || "Loading...";
  const displayAvatar = user?.result?.profileImage;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              {isLoading ? (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow">
                  {displayName[0]?.toUpperCase() || "B"}
                </div>
              ) : user?.result?.profileImage ? (
                <Image
                  src={user?.result?.profileImage}
                  alt={displayName}
                  width={44}
                  height={44}
                  className="rounded-full w-11 h-11 object-cover ring-2 ring-slate-100"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow">
                  {displayName[0]?.toUpperCase() || "B"}
                </div>
              )}
              <span
                className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusDot}`}
              />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-base leading-tight">
                {displayName}
              </h2>
              <p
                className={`text-xs font-medium ${
                  connectionStatus === "connected"
                    ? "text-emerald-500"
                    : "text-slate-400"
                }`}
              >
                {connectionStatus === "connected"
                  ? "● Active now"
                  : connectionStatus === "connecting"
                  ? "● Connecting..."
                  : "● Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-slate-500 hover:text-slate-700 rounded-full"
            >
              <TiArrowBack className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScrollTop}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
          style={{ background: "linear-gradient(to bottom, #f8fafc, #f1f5f9)" }}
        >
          {isFetchingMore && (
            <div className="flex justify-center py-2">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!hasMore && messages.length > 0 && (
            <p className="text-center text-xs text-slate-400 py-2">
              No more messages
            </p>
          )}

          {historyLoading && (
            <div className="flex justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Loading messages…</p>
              </div>
            </div>
          )}

          {!historyLoading && messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3 py-16">
                <div className="text-6xl">💬</div>
                <p className="text-slate-500 font-medium">No messages yet</p>
                <p className="text-slate-400 text-sm">
                  Start the conversation with {displayName}
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, index) => {
            const prev = messages[index - 1];
            const showDate =
              index === 0 ||
              (msg.createdAt &&
                prev?.createdAt &&
                new Date(prev.createdAt).toDateString() !==
                  new Date(msg.createdAt).toDateString());

            const isSeller = msg.sender === "seller";

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${
                    isSeller ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-end gap-2 max-w-[75%] ${
                      isSeller ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar for buyer */}
                    {!isSeller &&
                      (displayAvatar ? (
                        <Image
                          src={displayAvatar}
                          alt="buyer"
                          width={28}
                          height={28}
                          className="rounded-full w-7 h-7 object-cover flex-shrink-0 mb-1"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1">
                          {displayName[0]?.toUpperCase()}
                        </div>
                      ))}

                    {/* Message bubble */}
                    {msg.type === "offer" && msg.offerData ? (
                      <div className="flex flex-col">
                        <OfferCard
                          offer={msg.offerData}
                          sender={msg.sender}
                          onUpdateStatus={handleOfferUpdate}
                        />
                        <span
                          className={`text-[10px] text-slate-400 mt-1 ${
                            isSeller ? "text-right" : "text-left"
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div
                          className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                            isSeller
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-white text-slate-800 rounded-bl-md border border-slate-100"
                          }`}
                        >
                          {msg.imageUrl && (
                            <Image
                              src={msg.imageUrl}
                              alt="attachment"
                              width={200}
                              height={200}
                              className="rounded-xl mb-2 max-w-[200px] object-cover"
                            />
                          )}
                          {/* FIX: Only render content if it's a non-empty string */}
                          {typeof msg.content === "string" &&
                            msg.content.length > 0 && (
                              <p className="text-sm leading-relaxed">
                                {msg.content}
                              </p>
                            )}
                        </div>
                        <span
                          className={`text-[10px] text-slate-400 mt-1 ${
                            isSeller ? "text-right" : "text-left"
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt="typing"
                    width={28}
                    height={28}
                    className="rounded-full w-7 h-7 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-300 flex-shrink-0" />
                )}
                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex space-x-1">
                    {[0, 0.15, 0.3].map((d, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-slate-200 px-4 py-3 flex-shrink-0">
          {selectedFile && (
            <div className="mb-2 flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl">
              <Paperclip className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="text-xs text-slate-600 flex-1 truncate">
                {selectedFile.name}
              </span>
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setImageUrl("");
                  }}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || connectionStatus !== "connected"}
              className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-40"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  connectionStatus === "connected"
                    ? "Type a message…"
                    : "Connecting…"
                }
                disabled={isUploading || connectionStatus !== "connected"}
                className="rounded-full border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition-all px-4 py-2.5 text-sm"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={
                (!newMessage.trim() && !imageUrl) ||
                isUploading ||
                connectionStatus !== "connected"
              }
              className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 flex items-center justify-center p-0 transition-colors"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          {connectionStatus !== "connected" && (
            <p className="text-xs text-amber-500 mt-1.5 text-center">
              {connectionStatus === "connecting"
                ? "● Connecting…"
                : "● Disconnected — retrying…"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SidebarChat (buyer) ──────────────────────────────────────────────────────
// BUG-B4 FIX: connectWebSocket useEffect now has token in deps (not empty []).
// BUG-B5 FIX: conversation sync always merges new pages (removed conversations.length guard).
// BUG-B6 FIX: scroll restore uses justPrepended ref + skipNextScroll pattern.
// BUG-B8 FIX: stable WS message IDs.
function SidebarChat({
  token,
  userId,
  initialConversations,
}: {
  token: string;
  userId: string | undefined;
  initialConversations: Conversation[];
}) {
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [hasJoinedApp, setHasJoinedApp] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");

  const [convPages, setConvPages] = useState<Record<string, number>>({});
  const [convHasMore, setConvHasMore] = useState<Record<string, boolean>>({});
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const LIMIT = 20;

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const isConnecting = useRef(false);
  const currentPrivateChatUser = useRef<string | null>(null);
  const hasLoadedMessages = useRef<Set<string>>(new Set());
  const pendingJoinRef = useRef<string | null>(null);
  const prevScrollHeight = useRef<number>(0);

  // BUG-B6 FIX: scroll coordination refs
  const justPrepended = useRef(false);
  const skipNextScroll = useRef(false);
  const isFirstScroll = useRef(true);

  const userIdRef = useRef(userId);
  const selectedIdRef = useRef(selectedId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // BUG-B6 FIX: reset first-scroll flag when switching conversations
  useEffect(() => {
    isFirstScroll.current = true;
  }, [selectedId]);

  // BUG-B5 FIX: proper merge — always incorporate new pages, don't skip when
  // conversations is already populated.
  useEffect(() => {
    if (!initialConversations.length) return;
    setConversations((prev) => {
      if (!prev.length) return initialConversations;
      const map = new Map(prev.map((c) => [c.id, c]));
      initialConversations.forEach((ic) => {
        if (!map.has(ic.id)) {
          map.set(ic.id, ic);
        } else {
          const ex = map.get(ic.id)!;
          map.set(ic.id, {
            ...ex,
            unreadCount: ic.unreadCount,
            time: ic.time,
            avatar: ic.avatar,
          });
        }
      });
      return Array.from(map.values());
    });
  }, [initialConversations]);

  const currentConv = conversations.find((c) => c.id === selectedId) ?? null;
  const currentPage = convPages[selectedId] || 1;

  const [imageUpload, { isLoading: isImageUploading }] =
    useImageUploadMutation();
  const [updateOfferStatus] = useUpdateB2BOfferStatusMutation();

  const { data: historyData, isLoading: historyLoading } =
    useSingleConversationQuery(
      {
        conversationId: selectedId,
        limit: LIMIT,
        page: currentPage,
        chatType: "B2B",
      },
      { skip: !selectedId },
    );

  // History loading + infinite scroll
  useEffect(() => {
    if (!historyData?.result || !selectedId) return;

    const formatted = formatApiMessages(historyData.result, userIdRef.current);
    const isInitialLoad = !hasLoadedMessages.current.has(selectedId);

    if (formatted.length < LIMIT) {
      setConvHasMore((prev) => ({ ...prev, [selectedId]: false }));
    }

    if (isInitialLoad) {
      hasLoadedMessages.current.add(selectedId);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id !== selectedId ? conv : { ...conv, messages: formatted },
        ),
      );
    } else if (isFetchingMore) {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== selectedId) return conv;
          const existingIds = new Set(conv.messages.map((m) => m.id));
          const older = formatted.filter((m) => !existingIds.has(m.id));
          if (older.length === 0) return conv;
          justPrepended.current = true;
          return { ...conv, messages: [...older, ...conv.messages] };
        }),
      );
      setIsFetchingMore(false);
    }
  }, [historyData, selectedId, isFetchingMore]);

  // BUG-B6 FIX: synchronously restore scroll before paint when prepend happened
  useLayoutEffect(() => {
    if (justPrepended.current && messagesContainerRef.current) {
      skipNextScroll.current = true;
      const newHeight = messagesContainerRef.current.scrollHeight;
      messagesContainerRef.current.scrollTop =
        newHeight - prevScrollHeight.current;
      justPrepended.current = false;
    }
  }, [currentConv?.messages.length]);

  // BUG-B6 FIX: single scroll-to-bottom effect, skipped after prepend
  useEffect(() => {
    const msgCount = currentConv?.messages.length ?? 0;
    if (!selectedId || msgCount === 0) return;
    const isInitial = !hasLoadedMessages.current.has(selectedId);
    // Don't scroll before history is loaded
    if (isInitial) return;
    if (skipNextScroll.current) {
      skipNextScroll.current = false;
      return;
    }
    const behavior = isFirstScroll.current ? "auto" : "smooth";
    isFirstScroll.current = false;
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, [currentConv?.messages.length, selectedId]);

  const handleScrollTop = useCallback(() => {
    if (!messagesContainerRef.current || !selectedId) return;
    const hasMoreForConv = convHasMore[selectedId] !== false;
    if (
      messagesContainerRef.current.scrollTop < 80 &&
      hasMoreForConv &&
      !isFetchingMore
    ) {
      prevScrollHeight.current = messagesContainerRef.current.scrollHeight;
      setConvPages((prev) => ({
        ...prev,
        [selectedId]: (prev[selectedId] || 1) + 1,
      }));
      setIsFetchingMore(true);
    }
  }, [selectedId, convHasMore, isFetchingMore]);

  const cleanup = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen =
        wsRef.current.onclose =
        wsRef.current.onerror =
        wsRef.current.onmessage =
          null;
      if (wsRef.current.readyState === WebSocket.OPEN) wsRef.current.close();
      wsRef.current = null;
    }
    isConnecting.current = false;
  }, []);

  // BUG-B8 FIX: stable WS message IDs in handler
  const handleIncomingMessage = useCallback((data: WsMsg) => {
    if (!data.senderId) return;
    const isOwn = data.senderId === userIdRef.current;
    const otherUserId = isOwn ? data.receiverId : data.senderId;
    const offerData = tryParseOffer(data.content);
    const textContent = offerData
      ? ""
      : extractStringContent(data.content) ||
        extractStringContent(data.message);

    const newMsg: TextMessage = {
      id:
        data._id ||
        data.messageId ||
        `ws-${data.timestamp || Date.now()}-${data.senderId}`,
      type: offerData
        ? "offer"
        : data.imageUrl && !textContent
        ? "image"
        : "text",
      sender: isOwn ? "seller" : "buyer",
      content: textContent,
      offerData: offerData ?? undefined,
      imageUrl: data.imageUrl,
      timestamp: data.timestamp
        ? new Date(data.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      createdAt: data.timestamp || new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.buyerUserId !== otherUserId) return conv;
        if (conv.messages.some((m) => m.id === newMsg.id)) return conv;
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          unreadCount:
            isOwn || conv.id === selectedIdRef.current
              ? conv.unreadCount
              : conv.unreadCount + 1,
        };
      }),
    );
  }, []);

  const handlerRef = useRef(handleIncomingMessage);
  useEffect(() => {
    handlerRef.current = handleIncomingMessage;
  }, [handleIncomingMessage]);

  const connectWebSocket = useCallback(() => {
    if (!token) {
      setConnectionStatus("error");
      return;
    }
    if (isConnecting.current || wsRef.current?.readyState === WebSocket.OPEN)
      return;
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
        const parsed: WsMsg = JSON.parse(event.data);
        switch (parsed.type) {
          case "receivePrivateMessage":
            handlerRef.current(parsed);
            break;
          case "typing":
            setIsTyping(
              parsed.isTyping === true &&
                parsed.userId === currentPrivateChatUser.current,
            );
            break;
        }
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };
    ws.onclose = (event) => {
      setConnectionStatus("disconnected");
      setHasJoinedApp(false);
      isConnecting.current = false;
      currentPrivateChatUser.current = null;
      if (event.code !== 1000 && reconnectAttempts.current < 5) {
        const delay = 3000 * (reconnectAttempts.current + 1);
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

  const joinPrivateChat = useCallback(
    (buyerUserId: string) => {
      if (wsRef.current?.readyState !== WebSocket.OPEN || !hasJoinedApp) {
        pendingJoinRef.current = buyerUserId;
        return;
      }
      if (currentPrivateChatUser.current === buyerUserId) return;
      wsRef.current.send(
        JSON.stringify({
          type: "joinPrivateChat",
          user2Id: buyerUserId,
          chatType: "B2B",
        }),
      );
      currentPrivateChatUser.current = buyerUserId;
      pendingJoinRef.current = null;
    },
    [hasJoinedApp],
  );

  useEffect(() => {
    if (
      connectionStatus === "connected" &&
      hasJoinedApp &&
      pendingJoinRef.current
    ) {
      joinPrivateChat(pendingJoinRef.current);
    }
  }, [connectionStatus, hasJoinedApp, joinPrivateChat]);

  // BUG-B4 FIX: token in deps so stale closure is avoided when token changes
  useEffect(() => {
    if (token) connectWebSocket();
    return () => cleanup();
  }, [token, connectWebSocket, cleanup]);

  const handleSelect = useCallback(
    (conv: Conversation) => {
      setSelectedId(conv.id);
      setIsTyping(false);
      setMessage("");
      setImageUrl("");
      setSelectedFile(null);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)),
      );
      joinPrivateChat(conv.buyerUserId);
    },
    [joinPrivateChat],
  );

  const handleSendMessage = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed && !imageUrl) return;
    if (!currentConv) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    const payload: Record<string, string> = {
      type: "sendPrivateMessage",
      receiverId: currentConv.buyerUserId,
      content: trimmed,
      chatType: "B2B",
    };
    if (imageUrl) payload.imageUrl = imageUrl;
    wsRef.current.send(JSON.stringify(payload));
    setMessage("");
    setImageUrl("");
    setSelectedFile(null);
  }, [message, imageUrl, currentConv]);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    setSelectedFile(file);
    try {
      const formData = new FormData();
      formData.append("chatImage", file);
      const res = await imageUpload(formData).unwrap();
      setImageUrl(res?.result || "");
    } catch (e) {
      console.error("Upload failed:", e);
      setSelectedFile(null);
    }
  };

  const handleOfferUpdate = async (
    offerId: string,
    offerStatus: "ACCEPTED" | "REJECTED",
  ) => {
    try {
      await updateOfferStatus({ offerId, offerStatus }).unwrap();
      // Only update the relevant conversation's messages (not all)
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== selectedId) return conv;
          return {
            ...conv,
            messages: conv.messages.map((m) => {
              if (m.type === "offer" && m.offerData?.id === offerId) {
                return {
                  ...m,
                  offerData: { ...m.offerData!, offerStuts: offerStatus },
                };
              }
              return m;
            }),
          };
        }),
      );
    } catch (e) {
      console.error("Offer update failed:", e);
    }
  };

  const statusDot =
    connectionStatus === "connected"
      ? "bg-emerald-500"
      : connectionStatus === "connecting"
      ? "bg-amber-400 animate-pulse"
      : "bg-red-500";
  const canSend =
    connectionStatus === "connected" &&
    (!!message.trim() || !!imageUrl) &&
    !isImageUploading;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-[320px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h1 className="text-base font-bold text-slate-800">Messages</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${statusDot}`} />
              <span className="text-xs text-slate-500 capitalize">
                {connectionStatus}
              </span>
            </div>
          </div>
          <button
            onClick={connectWebSocket}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              <div className="text-3xl mb-2">📭</div>
              No conversations yet
            </div>
          )}
          {conversations.map((conv) => {
            const isSelected = selectedId === conv.id;
            const lastMsg = conv.messages[conv.messages.length - 1];
            return (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv)}
                className={`px-4 py-3.5 cursor-pointer transition-all border-b border-slate-50 ${
                  isSelected
                    ? "bg-blue-50 border-l-[3px] border-l-blue-500"
                    : "hover:bg-slate-50 border-l-[3px] border-l-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      {conv.avatar ? (
                        <Image
                          src={conv.avatar}
                          alt={conv.seller}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {conv.seller[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {connectionStatus === "connected" && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isSelected ? "text-blue-700" : "text-slate-800"
                        }`}
                      >
                        {conv.seller}
                      </p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">
                        {conv.time
                          ? new Date(conv.time).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {lastMsg?.type === "offer"
                        ? "📦 Offer: $" +
                          lastMsg.offerData?.totalPrice?.toLocaleString()
                        : typeof lastMsg?.content === "string"
                        ? lastMsg.content || conv.product
                        : conv.product}
                    </p>
                    <p className="text-[10px] text-blue-400 font-medium mt-0.5">
                      {conv.orderNumber}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 flex-shrink-0 mt-0.5">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {currentConv ? (
          <>
            <div className="px-5 py-3.5 border-b border-slate-200 bg-white flex items-center gap-3 shadow-sm flex-shrink-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  {currentConv.avatar ? (
                    <Image
                      src={currentConv.avatar}
                      alt={currentConv.seller}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {currentConv.seller[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                {connectionStatus === "connected" && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm leading-tight">
                  {currentConv.seller}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block ${statusDot}`}
                  />
                  {connectionStatus === "connected" ? "Online" : "Offline"}
                  {currentConv.email ? ` · ${currentConv.email}` : ""}
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-mono">
                  {currentConv.orderNumber}
                </span>
              </div>
            </div>

            <div
              ref={messagesContainerRef}
              onScroll={handleScrollTop}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
              style={{
                background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
              }}
            >
              {isFetchingMore && (
                <div className="flex justify-center py-2">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {convHasMore[selectedId] === false &&
                (currentConv?.messages.length ?? 0) > 0 && (
                  <p className="text-center text-[10px] text-slate-400 py-1">
                    Beginning of conversation
                  </p>
                )}

              {historyLoading && (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!historyLoading && currentConv.messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2 py-12">
                    <div className="text-5xl">💬</div>
                    <p className="text-slate-500 font-medium">
                      No messages yet
                    </p>
                    <p className="text-slate-400 text-sm">
                      Say hello to {currentConv.seller}!
                    </p>
                  </div>
                </div>
              )}

              {currentConv.messages.map((msg, index) => {
                const prev = currentConv.messages[index - 1];
                const showDate =
                  index === 0 ||
                  (msg.createdAt &&
                    prev?.createdAt &&
                    new Date(prev.createdAt).toDateString() !==
                      new Date(msg.createdAt).toDateString());
                const isSeller = msg.sender === "seller";

                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                          {new Date(msg.createdAt).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex items-end gap-2 ${
                        isSeller ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isSeller &&
                        (currentConv.avatar ? (
                          <Image
                            src={currentConv.avatar}
                            alt="buyer"
                            width={28}
                            height={28}
                            className="rounded-full w-7 h-7 object-cover flex-shrink-0 mb-1"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1">
                            {currentConv.seller[0]?.toUpperCase()}
                          </div>
                        ))}

                      {msg.type === "offer" && msg.offerData ? (
                        <div className="flex flex-col">
                          <OfferCard
                            offer={msg.offerData}
                            sender={msg.sender}
                            onUpdateStatus={handleOfferUpdate}
                          />
                          <span
                            className={`text-[10px] text-slate-400 mt-1 ${
                              isSeller ? "text-right" : "text-left"
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col max-w-xs md:max-w-sm lg:max-w-md">
                          <div
                            className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                              isSeller
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white text-slate-800 rounded-bl-none border border-slate-100"
                            }`}
                          >
                            {msg.imageUrl && (
                              <Image
                                src={msg.imageUrl}
                                alt="attachment"
                                width={200}
                                height={200}
                                className="rounded-xl mb-2 max-w-[200px] object-cover"
                              />
                            )}
                            {typeof msg.content === "string" &&
                              msg.content.length > 0 && (
                                <p className="text-sm break-words leading-relaxed">
                                  {msg.content}
                                </p>
                              )}
                          </div>
                          <span
                            className={`text-[10px] text-slate-400 mt-1 ${
                              isSeller ? "text-right" : "text-left"
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}

              {isTyping && (
                <div className="flex items-end gap-2">
                  {currentConv.avatar ? (
                    <Image
                      src={currentConv.avatar}
                      alt="typing"
                      width={28}
                      height={28}
                      className="rounded-full w-7 h-7 object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-300" />
                  )}
                  <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                    <div className="flex space-x-1">
                      {[0, 0.15, 0.3].map((d, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${d}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-3 border-t border-slate-200 bg-white flex-shrink-0">
              {selectedFile && (
                <div className="mb-2 flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl">
                  <Paperclip className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="text-xs text-slate-600 flex-1 truncate">
                    {selectedFile.name}
                  </span>
                  {isImageUploading ? (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setImageUrl("");
                      }}
                    >
                      <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={
                    isImageUploading || connectionStatus !== "connected"
                  }
                  className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-40"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    connectionStatus === "connected"
                      ? "Type a message…"
                      : "Connecting…"
                  }
                  className="flex-1 rounded-full border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white transition-all px-4 text-sm"
                  disabled={connectionStatus !== "connected"}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!canSend}
                  className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 p-0 flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  {isImageUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {connectionStatus !== "connected" && (
                <p className="text-xs text-amber-500 mt-1.5 text-center">
                  {connectionStatus === "connecting"
                    ? "● Connecting…"
                    : "● Disconnected — retrying…"}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 bg-slate-50">
            <div className="text-center space-y-3">
              <div className="text-6xl">💬</div>
              <p className="text-slate-600 font-semibold text-lg">
                Select a conversation
              </p>
              <p className="text-slate-400 text-sm">
                Choose from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MessagesPage (root) ──────────────────────────────────────────────────────
// BUG-B7 FIX: isDirectMode no longer defaults to `true` when urlSellerId is
//             absent — it is correctly initialized from the URL param and
//             DirectChat is never rendered with a null user2Id.
export default function MessagesPage() {
  const token = useAppSelector((state: RootState) => state.auth.access_token);
  const userId = useAppSelector((state: RootState) => state.auth.user?.id);

  const searchParams = useSearchParams();
  const urlSellerId = searchParams.get("sellerId");
  const urlProductId = searchParams.get("productId");

  // BUG-B7 FIX: start in direct mode ONLY when sellerId is present in the URL
  const [isDirectMode, setIsDirectMode] = useState(!!urlSellerId);
  const [matchedConv, setMatchedConv] = useState<Conversation | null>(null);

  const { data, error, isLoading } = useGetSellerB2BConversationsListQuery({});

  const conversations = useMemo<Conversation[]>(() => {
    const list: any[] = data?.result?.result ?? [];
    if (!list.length) return [];
    return list?.map((conv: any) => ({
      id: conv.conversationId,
      buyerUserId: conv.participants?.userId ?? "",
      seller: conv.participants?.username ?? "Unknown Buyer",
      product: "B2B Conversation",
      orderNumber: `#${(conv.conversationId ?? "").slice(-8).toUpperCase()}`,
      time: conv.lastMessageTime
        ? new Date(conv.lastMessageTime).toISOString()
        : "",
      avatar: conv.participants?.image ?? "",
      unreadCount: conv.unseen ?? 0,
      email: conv.participants?.email || "",
      messages: [],
    }));
  }, [data]);

  // useEffect(() => {
  //   if (!urlSellerId) {
  //     setIsDirectMode(false);
  //     setMatchedConv(null);
  //     return;
  //   }
  //   const match = conversations.find((c) => c.buyerUserId === urlSellerId) ?? null;
  //   setMatchedConv(match);
  //   // Stay in direct mode; match just enriches the conv prop passed to DirectChat
  // }, [conversations, urlSellerId]);

  useEffect(() => {
    const match =
      conversations.find((c) => c.buyerUserId === urlSellerId) ?? null;
    setMatchedConv(match);
    setIsDirectMode(!match);
  }, [conversations, urlSellerId]);

  if (!token)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center space-y-2">
          <div className="text-4xl">🔒</div>
          <p className="text-red-500 font-semibold">
            Session expired — please login
          </p>
        </div>
      </div>
    );

  if (isLoading && !isDirectMode)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm">Loading conversations…</p>
        </div>
      </div>
    );

  if (error && !isDirectMode)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center space-y-2">
          <div className="text-4xl">⚠️</div>
          <p className="text-red-500 font-semibold">
            Error loading conversations
          </p>
        </div>
      </div>
    );

  // BUG-B7 FIX: guard ensures DirectChat is only rendered with a valid user2Id
  if (isDirectMode && urlSellerId) {
    return (
      <DirectChat
        key={urlSellerId}
        user2Id={urlSellerId}
        productId={urlProductId}
        token={token}
        userId={userId}
        conv={matchedConv}
      />
    );
  }

  if (!isLoading && conversations.length === 0)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center space-y-2">
          <div className="text-4xl">📭</div>
          <p className="text-slate-500">No conversations available</p>
        </div>
      </div>
    );

  return (
    <SidebarChat
      token={token}
      userId={userId}
      initialConversations={conversations}
    />
  );
}
