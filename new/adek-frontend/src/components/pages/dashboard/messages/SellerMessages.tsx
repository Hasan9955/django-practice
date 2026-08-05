/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/Avatar/avatar";
import { Input } from "@/components/ui/Input/Input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetConversationListQuery,
  useSingleConversationQuery,
} from "@/redux/features/messages/messagesApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Reply, X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  KeyboardEvent,
} from "react";
import { FaLink } from "react-icons/fa";
import { RiSendPlaneFill } from "react-icons/ri";

/* ------------------------------------------------------------------ */
/*  WebSocket Message Types                                            */
/* ------------------------------------------------------------------ */
const WSMessageType = {
  JOIN_PRIVATE_CHAT: "joinPrivateChat",
  SEND_PRIVATE_MESSAGE: "sendPrivateMessage",
  RECEIVED_PRIVATE_MESSAGE: "receivePrivateMessage",
  CONVERSATION_LIST: "conversationList",
  TICKET_LIST: "ticketList",
  REFUND_LIST: "refundList",
  JOIN_CONVERSATION_LIST: "joinConversationList",
  AUTH_SUCCESS: "authSuccess",
  AUTH_FAILURE: "authFailure",
  FAILURE: "Failure",
  JOIN_APP: "joinApp",
  JOIN_GROUP: "joinGroup",
  SEND_GROUP_MESSAGE: "sendGroupMessage",
  RECEIVED_GROUP_MESSAGE: "receiveGroupMessage",
} as const;

type WSMessageTypeValue = (typeof WSMessageType)[keyof typeof WSMessageType];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Participant {
  userId: string;
  username: string;
  image?: string;
}

interface Conversation {
  conversationId: string;
  type: "private" | "group";
  participants: Participant;
  lastMessage: string;
  lastMessageTime: string;
  unseen: number;
  messages: Message[];
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  createdAt: string;
  isOwn: boolean;
  imageUrl?: string;
}

interface WebSocketMessage {
  type: WSMessageTypeValue | string;
  id?: string;
  senderId?: string;
  receiverId?: string;
  content?: string;
  createdAt?: string;
  timestamp?: string;
  imageUrl?: string;
  conversationId?: string;
  message?: string;
  receiver?: {
    image?: string;
    username?: string;
    id?: string;
  };
  result?: {
    conversations?: Array<{
      conversationId: string;
      participants: Participant;
      lastMessage: string;
      lastMessageTime: string;
      unseen: number;
    }>;
  };
}

/* ------------------------------------------------------------------ */
/*  ChatMessage – memoised                                             */
/* ------------------------------------------------------------------ */
const ChatMessage = memo(function ChatMessage({
  msg,
  isOwn,
  participant,
  showOptions,
  setShowOptions,
  setReplyingTo,
  onDelete,
}: {
  msg: Message;
  isOwn: boolean;
  participant: Participant;
  showOptions: string | null;
  setShowOptions: (id: string | null) => void;
  setReplyingTo: (m: Message | null) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
      <div className="flex items-end gap-2 max-w-[72%] relative">
        {/* Other person avatar */}
        {!isOwn && (
          <Avatar className="h-8 w-8 shrink-0 ring-2 ring-white shadow-sm">
            <AvatarImage src={participant.image} />
            <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
              {participant.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Bubble */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl shadow-sm cursor-pointer select-text ${
            isOwn
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"
          }`}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowOptions(msg.id);
          }}
        >
          {msg.imageUrl && (
            <Image
              src={msg.imageUrl}
              width={300}
              height={200}
              alt="sent"
              className="max-w-full rounded-lg mb-2 max-h-60 object-cover"
            />
          )}
          {msg.text && (
            <p className="text-sm leading-relaxed break-words">{msg.text}</p>
          )}
          <p
            className={`text-[10px] mt-1 text-right ${
              isOwn ? "text-blue-200" : "text-gray-400"
            }`}
          >
            {msg.timestamp}
          </p>
        </div>

        {/* Context menu */}
        {showOptions === msg.id && (
          <div
            className={`absolute top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl p-1 z-20 min-w-[120px] ${
              isOwn ? "right-10" : "left-10"
            }`}
          >
            <button
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              onClick={() => {
                setReplyingTo(msg);
                setShowOptions(null);
              }}
            >
              ↩ Reply
            </button>
            <button
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(msg.text);
                setShowOptions(null);
              }}
            >
              ⎘ Copy
            </button>
            {isOwn && (
              <button
                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                onClick={() => {
                  onDelete(msg.id);
                  setShowOptions(null);
                }}
              >
                ✕ Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
ChatMessage.displayName = "ChatMessage";

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */
export default function SellerMessages() {
  const token = useAppSelector((state: RootState) => state.auth.access_token);
  const userId = useAppSelector((state: RootState) => state.auth.user?.id);

  /* ---------- RTK Queries ---------- */
  const { data: conversationData, isLoading } = useGetConversationListQuery({});
  const conversationsData = conversationData?.result || [];

  /* ---------- State ---------- */
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const [showOpts, setShowOpts] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [messageUpdateCounter, setMessageUpdateCounter] = useState(0);

  const convId = activeConversation?.conversationId;
  const { data: singleConv } = useSingleConversationQuery(
    {
      conversationId: convId || "",
      limit: 9999,
      page: 1,
      chatType: "PRIVATEMESSAGE",
    },
    { skip: !convId },
  );

  /* ---------- Refs ---------- */
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const isConnecting = useRef(false);
  const currentPrivateChatUser = useRef<string | null>(null);
  const hasJoinedApp = useRef(false);

  /*
   * FIX 1 — activeConvIdRef:
   * ws.onmessage is set ONCE when the socket opens and captures a stale
   * closure. Reading activeConversation?.conversationId inside the handler
   * would always return null. Instead we keep this ref in sync and read it.
   */
  const activeConvIdRef = useRef<string | null>(null);

  /*
   * FIX 2 — handleIncomingRef:
   * ws.onmessage delegates to this ref so it always calls the LATEST
   * version of handleIncomingPrivateMessage, regardless of when the
   * WebSocket was created.
   */
  const handleIncomingRef = useRef<(data: WebSocketMessage) => void>(() => {});

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /* Keep activeConvIdRef current on every render */
  useEffect(() => {
    activeConvIdRef.current = activeConversation?.conversationId ?? null;
  }, [activeConversation?.conversationId]);

  /* ---------- Cleanup ---------- */
  const cleanup = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    isConnecting.current = false;
    hasJoinedApp.current = false;
  }, []);

  /* ---------- connectWebSocket ---------- */
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
      console.log("✅ WS Connected");
      setConnectionStatus("connected");
      setIsAuthenticated(true);
      reconnectAttempts.current = 0;
      isConnecting.current = false;
      ws.send(JSON.stringify({ type: WSMessageType.JOIN_APP }));
      hasJoinedApp.current = true;
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        console.log("📨 WS:", data.type, data);

        switch (data.type) {
          /* ── Server-pushed conversation list — merge, never reset ── */
          case WSMessageType.CONVERSATION_LIST:
            if (data.result?.conversations) {
              const wsList = data.result.conversations.map((c) => ({
                conversationId: c.conversationId,
                type: "private" as const,
                participants: c.participants,
                lastMessage: c.lastMessage,
                lastMessageTime: c.lastMessageTime,
                unseen: c.unseen,
                messages: [] as Message[],
              }));
              setConversations((prev) => {
                if (prev.length === 0) return wsList;
                return prev
                  .map((existing) => {
                    const fresh = wsList.find(
                      (w) => w.conversationId === existing.conversationId,
                    );
                    if (!fresh) return existing;
                    return {
                      ...fresh,
                      messages: existing.messages,
                      unseen: existing.unseen,
                    };
                  })
                  .concat(
                    wsList.filter(
                      (w) =>
                        !prev.some(
                          (p) => p.conversationId === w.conversationId,
                        ),
                    ),
                  );
              });
            }
            break;

          /*
           * FIX 2 applied:
           * Always route through the ref so the latest handler runs —
           * never the stale one captured at connection time.
           */
          case "receivePrivateMessage":
          case WSMessageType.RECEIVED_PRIVATE_MESSAGE:
            handleIncomingRef.current(data);
            break;

          case WSMessageType.RECEIVED_GROUP_MESSAGE:
            console.log("📨 Group message:", data);
            break;

          case WSMessageType.AUTH_SUCCESS:
            console.log("✅ Auth success");
            break;

          /* Hard auth failure → mark connection broken */
          case WSMessageType.AUTH_FAILURE:
            console.error("❌ Auth failure:", data);
            setConnectionStatus("error");
            break;

          /*
           * Soft "Failure" (room already joined, ticket/refund ops, etc.)
           * Log only — do NOT change connection status.
           */
          case WSMessageType.FAILURE:
            console.warn("⚠️ Server notice (non-critical):", data);
            break;

          /* Acknowledged no-op events */
          case WSMessageType.TICKET_LIST:
          case WSMessageType.REFUND_LIST:
          case WSMessageType.JOIN_CONVERSATION_LIST:
          case WSMessageType.JOIN_GROUP:
          case WSMessageType.SEND_GROUP_MESSAGE:
            console.log(`ℹ️ ${data.type}:`, data);
            break;

          default:
            console.log("ℹ️ Unknown WS type:", data.type, data);
        }
      } catch (error) {
        console.error("❌ Parse error:", error);
      }
    };

    ws.onclose = (event) => {
      console.warn("⚠️ WS Closed", event.code);
      setConnectionStatus("disconnected");
      setIsAuthenticated(false);
      hasJoinedApp.current = false;
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

  /* ---------- joinPrivateChat ---------- */
  const joinPrivateChat = useCallback((user2Id: string) => {
    if (
      wsRef.current?.readyState === WebSocket.OPEN &&
      hasJoinedApp.current &&
      currentPrivateChatUser.current !== user2Id
    ) {
      wsRef.current.send(
        JSON.stringify({ type: WSMessageType.JOIN_PRIVATE_CHAT, user2Id }),
      );
      currentPrivateChatUser.current = user2Id;
    }
  }, []);

  /* ---------- handleConversationSelect ---------- */
  const handleConversationSelect = useCallback(
    (conversation: Conversation) => {
      /* Clear unseen count when opening */
      setActiveConversation({ ...conversation, unseen: 0 });
      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conversation.conversationId
            ? { ...c, unseen: 0 }
            : c,
        ),
      );
      joinPrivateChat(conversation.participants.userId);
    },
    [joinPrivateChat],
  );

  /* ---------- handleIncomingPrivateMessage ---------- */
  /*
   * FIX 1 + FIX 2 applied:
   * - Uses activeConvIdRef.current (always fresh) instead of
   *   activeConversation?.conversationId (stale closure).
   * - activeConversation removed from deps entirely.
   * - handleIncomingRef.current is updated every render (line below).
   */
  const handleIncomingPrivateMessage = useCallback(
    (data: WebSocketMessage) => {
      const {
        id,
        senderId,
        content,
        createdAt,
        conversationId,
        receiver,
        imageUrl,
      } = data;

      if (!id || !senderId || !conversationId) {
        console.warn("⚠️ Missing required fields:", data);
        return;
      }

      const ts = createdAt
        ? new Date(createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

      const newMsg: Message = {
        id,
        text: content || "",
        timestamp: ts,
        createdAt: createdAt || new Date().toISOString(),
        isOwn: senderId === userId,
        imageUrl,
      };

      /* Read the ref — always the current value, never stale */
      const currentActiveConvId = activeConvIdRef.current;
      const isActiveConv = currentActiveConvId === conversationId;

      /* ── 1. Update sidebar + bubble to top ── */
      setConversations((prev) => {
        const idx = prev.findIndex(
          (c) =>
            c.conversationId === conversationId ||
            c.participants.userId === senderId,
        );

        if (idx !== -1) {
          // Copy the found conversation and update it
          const conv = { ...prev[idx] };

          // Dedup by message id
          if (!conv.messages.some((m) => m.id === id)) {
            conv.messages = [...conv.messages, newMsg];
          }

          conv.lastMessage = imageUrl ? "📷 Image" : content || "";
          conv.lastMessageTime = createdAt || new Date().toISOString();

          // Only bump unseen badge for conversations NOT currently open
          if (!isActiveConv) {
            conv.unseen = conv.unseen + 1;
          }

          // Update participant info if receiver data is fresher
          if (receiver && senderId !== userId) {
            conv.participants = {
              ...conv.participants,
              image: receiver.image || conv.participants.image,
              username: receiver.username || conv.participants.username,
            };
          }

          // Remove from current index and prepend to top (active update index)
          const rest = prev.filter((_, i) => i !== idx);
          return [conv, ...rest];
        }

        // Brand-new conversation — prepend to top
        return [
          {
            conversationId,
            type: "private",
            participants: {
              userId: senderId,
              username: receiver?.username || "Unknown",
              image: receiver?.image,
            },
            lastMessage: imageUrl ? "📷 Image" : content || "",
            lastMessageTime: createdAt || new Date().toISOString(),
            unseen: isActiveConv ? 0 : 1,
            messages: [newMsg],
          },
          ...prev,
        ];
      });

      /* ── 2. Update chat message area ── */
      if (isActiveConv) {
        setActiveConversation((prev) => {
          if (!prev) return prev;

          /* Exact-id dedup */
          if (prev.messages.some((m) => m.id === id)) return prev;

          /*
           * Own-message echo reconciliation:
           * The server echoes our sent message back with a real server ID.
           * Find the matching optimistic placeholder and replace it in-place
           * so the message doesn't appear twice in the chat.
           */
          if (senderId === userId) {
            const optIdx = prev.messages.findIndex(
              (m) =>
                m.id.startsWith("opt-") &&
                m.text === (content || "") &&
                Math.abs(
                  new Date(m.createdAt).getTime() -
                    new Date(createdAt || 0).getTime(),
                ) < 5000,
            );
            if (optIdx !== -1) {
              const updated = [...prev.messages];
              updated[optIdx] = newMsg; /* replace optimistic → real */
              setMessageUpdateCounter((c) => c + 1);
              return { ...prev, messages: updated };
            }
          }

          setMessageUpdateCounter((c) => c + 1);
          return { ...prev, messages: [...prev.messages, newMsg] };
        });
      }
    },
    [userId],
    /* No activeConversation in deps — activeConvIdRef handles it */
  );

  /* Always keep the ref pointing to the latest handler version */
  useEffect(() => {
    handleIncomingRef.current = handleIncomingPrivateMessage;
  });

  /* ---------- sendMessage (optimistic) ---------- */
  const sendMessage = useCallback(() => {
    if (
      !activeConversation ||
      (!newMessage.trim() && !selectedFile) ||
      !isAuthenticated ||
      !hasJoinedApp.current ||
      wsRef.current?.readyState !== WebSocket.OPEN
    )
      return;

    const content =
      newMessage || (selectedFile ? `[File: ${selectedFile.file.name}]` : "");

    const payload: any = {
      type: WSMessageType.SEND_PRIVATE_MESSAGE,
      receiverId: activeConversation.participants.userId,
      content,
    };
    if (selectedFile) payload.imageUrl = selectedFile.preview;

    /* Optimistic placeholder — shown instantly before server echo */
    const optimistic: Message = {
      id: `opt-${Date.now()}-${Math.random()}`,
      text: content,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: new Date().toISOString(),
      isOwn: true,
      imageUrl: selectedFile?.preview,
    };

    wsRef.current.send(JSON.stringify(payload));

    setActiveConversation((p) => {
      if (!p) return p;
      return { ...p, messages: [...p.messages, optimistic] };
    });

    // Update sidebar and bubble the active conversation to top
    setConversations((prev) => {
      const idx = prev.findIndex(
        (c) => c.conversationId === activeConversation.conversationId,
      );
      if (idx === -1) return prev;
      const updated = {
        ...prev[idx],
        messages: [...prev[idx].messages, optimistic],
        lastMessage: selectedFile ? "📷 Image" : newMessage,
        lastMessageTime: optimistic.createdAt,
      };
      const rest = prev.filter((_, i) => i !== idx);
      return [updated, ...rest];
    });

    setMessageUpdateCounter((c) => c + 1);
    setNewMessage("");
    setSelectedFile(null);
  }, [activeConversation, newMessage, selectedFile, isAuthenticated]);

  /* ---------- file upload ---------- */
  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () =>
      setSelectedFile({ file: f, preview: reader.result as string });
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  /* ---------- delete (client-side only) ---------- */
  const deleteMessage = (id: string) => {
    setActiveConversation((p) =>
      p ? { ...p, messages: p.messages.filter((m) => m.id !== id) } : p,
    );
  };

  /* ---------- Load conversation list from RTK ---------- */
  /*
   * Shows ALL conversations returned by the API — no userId filtering.
   * Merges into existing WS state so live messages/unseen counts are
   * never lost when RTK re-fetches.
   * Sorted by most-recent message time descending on first load.
   */
  useEffect(() => {
    if (!conversationsData.length) return;

    const rtkList: Conversation[] = conversationsData.map((conv: any) => ({
      conversationId: conv.conversationId ?? conv.id ?? `conv-${Date.now()}`,
      type: (conv.type as "private" | "group") ?? "private",
      participants: conv.participants ?? {
        userId: conv.userId ?? conv.user?.id ?? "",
        username:
          conv.username ??
          conv.user?.username ??
          conv.participants?.username ??
          "Unknown",
        image: conv.image ?? conv.user?.image ?? conv.participants?.image,
      },
      lastMessage: conv.lastMessage ?? "",
      lastMessageTime: conv.lastMessageTime ?? new Date().toISOString(),
      unseen: conv.unseen ?? 0,
      messages: [],
    }));

    setConversations((prev) => {
      if (prev.length === 0) {
        // First load — sort by most-recent time descending
        return [...rtkList].sort(
          (a, b) =>
            new Date(b.lastMessageTime).getTime() -
            new Date(a.lastMessageTime).getTime(),
        );
      }
      // Subsequent loads — merge metadata but keep live WS order / messages / unseen
      return prev
        .map((existing) => {
          const fresh = rtkList.find(
            (r) => r.conversationId === existing.conversationId,
          );
          if (!fresh) return existing;
          // Refresh metadata (username, image, lastMessage from API) but
          // keep WS-accumulated messages and unseen count
          return {
            ...fresh,
            messages: existing.messages,
            unseen: existing.unseen,
          };
        })
        .concat(
          // Add any brand-new conversations from API not yet in local state
          rtkList.filter(
            (r) => !prev.some((p) => p.conversationId === r.conversationId),
          ),
        );
    });
  }, [conversationsData]);

  /* ---------- Load historic messages from RTK for active conversation ---------- */
  /*
   * Merges API messages with any WS/optimistic messages already in state.
   * Never overwrites — only adds API messages not yet present.
   */
  useEffect(() => {
    if (!singleConv?.result || !convId) return;

    const sorted = [...singleConv.result].sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const apiMsgs: Message[] = sorted.map((m: any) => ({
      id: m.id ?? m._id,
      text: m.content ?? "",
      timestamp: new Date(m.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: m.createdAt,
      isOwn: m.senderId === userId,
      imageUrl: m.imageUrl,
    }));

    const merge = (existing: Message[]): Message[] => {
      const apiIds = new Set(apiMsgs.map((m) => m.id));
      /* Keep WS/optimistic messages not yet confirmed by API */
      const wsOnly = existing.filter((m) => !apiIds.has(m.id));
      return [...apiMsgs, ...wsOnly].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    };

    /* Update chat area */
    setActiveConversation((prev) => {
      if (!prev) return prev;
      return { ...prev, messages: merge(prev.messages) };
    });

    /* Sync sidebar entry without losing WS messages */
    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === convId ? { ...c, messages: merge(c.messages) } : c,
      ),
    );
  }, [singleConv?.result, convId, userId]);

  /* ---------- Connect on mount ---------- */
  useEffect(() => {
    if (token && !wsRef.current) connectWebSocket();
    return cleanup;
  }, [token, connectWebSocket, cleanup]);

  /* ---------- Auto-scroll ---------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages.length, messageUpdateCounter]);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Derived: sidebar conversation list                                */
  /*                                                                    */
  /*  Layout rule:                                                      */
  /*    [0]   active conversation — always pinned at the top            */
  /*    [1…]  all others — sorted by lastMessageTime descending         */
  /*                                                                    */
  /*  Search filters both sections by username or last message.         */
  /* ------------------------------------------------------------------ */
  const filteredConversations = (() => {
    const q = searchQuery.trim().toLowerCase();

    // Apply search filter first (no search = show all)
    const searched = q
      ? conversations.filter(
          (c) =>
            c.participants.username.toLowerCase().includes(q) ||
            c.lastMessage.toLowerCase().includes(q),
        )
      : conversations;

    const activeId = activeConversation?.conversationId ?? null;

    // Split into active (pinned) + rest
    const active = searched.filter((c) => c.conversationId === activeId);
    const rest = searched
      .filter((c) => c.conversationId !== activeId)
      .sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime(),
      );

    return [...active, ...rest];
  })();

  /* ------------------------------------------------------------------ */
  /*  UI                                                                 */
  /* ------------------------------------------------------------------ */
  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 font-semibold">
        Token Missing — Please Login
      </div>
    );
  }

  return (
    <div className=" min-h-screen">
      <div className="flex gap-4 p-4">
        {/* ══════════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════════ */}
        <div className="w-[320px] shrink-0 bg-white rounded-2xl shadow-sm flex flex-col h-[calc(100vh-32px)] overflow-hidden">
          {/* Sidebar header */}
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <h1 className="text-lg font-bold text-gray-900 mb-3">Messages</h1>
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <Input
                placeholder="Search conversations…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Conversation list */}
          <ScrollArea className="flex-1">
            <div className="px-3 py-2 space-y-0.5">
              {isLoading ? (
                <div className="flex flex-col gap-3 py-4 px-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 animate-pulse"
                    >
                      <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">
                    {searchQuery
                      ? "No conversations found"
                      : "No conversations yet"}
                  </p>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isActive =
                    activeConversation?.conversationId === c.conversationId;
                  return (
                    <div
                      key={c.conversationId}
                      onClick={() => handleConversationSelect(c)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
                        isActive
                          ? "bg-blue-600 shadow-md shadow-blue-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Avatar with online dot */}
                      <div className="relative shrink-0">
                        <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm">
                          <AvatarImage
                            src={c.participants.image}
                            className="object-cover"
                          />
                          <AvatarFallback
                            className={`text-sm font-bold ${
                              isActive
                                ? "bg-blue-500 text-white"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {c.participants.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      </div>

                      {/* Text info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p
                            className={`font-semibold text-sm truncate ${
                              isActive ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {c.participants.username}
                          </p>
                          <span
                            className={`text-[10px] shrink-0 ml-2 ${
                              isActive ? "text-blue-200" : "text-gray-400"
                            }`}
                          >
                            {new Date(c.lastMessageTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p
                            className={`text-xs truncate ${
                              isActive ? "text-blue-200" : "text-gray-500"
                            }`}
                          >
                            {c.lastMessage || "Start a conversation"}
                          </p>
                          {c.unseen > 0 && !isActive && (
                            <span className="ml-2 shrink-0 min-w-[20px] h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                              {c.unseen > 99 ? "99+" : c.unseen}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ══════════════════════════════════════════
            CHAT AREA
        ══════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col h-[calc(100vh-32px)] min-w-0">
          {activeConversation ? (
            <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                      <AvatarImage
                        src={activeConversation.participants.image}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">
                        {activeConversation.participants.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm leading-tight">
                      {activeConversation.participants.username}
                    </h2>
                    <p className="text-xs text-green-500 font-medium">
                      ● Online
                    </p>
                  </div>
                </div>
                {connectionStatus !== "connected" && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-medium capitalize">
                    {connectionStatus}
                  </span>
                )}
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-hidden bg-[#F4F7FF]">
                <ScrollArea className="h-full">
                  <div className="px-5 py-5 space-y-3">
                    {activeConversation.messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-400 font-medium">
                          No messages yet — say hello!
                        </p>
                      </div>
                    ) : (
                      activeConversation.messages.map((m, idx) => (
                        <ChatMessage
                          key={`${m.id}-${idx}`}
                          msg={m}
                          isOwn={m.isOwn}
                          participant={activeConversation.participants}
                          showOptions={showOpts}
                          setShowOptions={setShowOpts}
                          setReplyingTo={setReplyingTo}
                          onDelete={deleteMessage}
                        />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Reply banner */}
              {replyingTo && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border-t border-blue-100 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-0.5 h-8 bg-blue-600 rounded-full shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-0.5">
                        Replying to
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {replyingTo.text.substring(0, 60)}…
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="ml-3 w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors shrink-0"
                  >
                    <X className="w-3 h-3 text-blue-600" />
                  </button>
                </div>
              )}

              {/* File preview banner */}
              {selectedFile && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-100 shrink-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedFile.preview}
                      alt="preview"
                      className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                    />
                    <div>
                      <p className="text-xs font-medium text-gray-800 truncate max-w-[200px]">
                        {selectedFile.file.name}
                      </p>
                      <p className="text-[10px] text-gray-400">Ready to send</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="ml-3 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors shrink-0"
                  >
                    <X className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              )}

              {/* Input bar */}
              <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-3 py-2 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  {/* Attach button */}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                  >
                    <FaLink className="w-4 h-4" />
                  </button>

                  {/* Text input */}
                  <Input
                    placeholder="Type a message…"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 py-0 h-8 text-sm text-gray-900 placeholder:text-gray-400"
                  />

                  {/* Send button */}
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() && !selectedFile}
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    <RiSendPlaneFill className="w-4 h-4 text-white disabled:text-gray-400" />
                  </button>
                </div>
              </div>

              <input
                type="file"
                ref={fileRef}
                onChange={uploadFile}
                className="hidden"
                accept="image/*"
              />
            </div>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-gray-900 mb-1">Your Messages</h3>
                <p className="text-sm text-gray-400">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dismiss context menu on outside click */}
      {showOpts && (
        <div className="fixed inset-0 z-10" onClick={() => setShowOpts(null)} />
      )}
    </div>
  );
}
