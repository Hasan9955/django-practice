/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { TicketList } from "./ticket-list";
import { TicketDetail } from "./ticket-detail";
import { CreateTicketModal } from "./create-ticket-modal";
import {
  useCreateTicketMutation,
  useGetAllTicketsQuery,
  useGetSingleTicketMessageQuery,
} from "@/redux/features/ticket/ticketApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import useWebSocket, { ReadyState } from "react-use-websocket";

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */
export type TicketStatus = "pending" | "open" | "solved" | "cancelled";
export type TicketPriority = "low" | "medium" | "high";

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  /** true  → came from support agent
   *  false → sent by the logged-in user */
  isSupport: boolean;
  attachments?: Attachment[];
  senderId?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  department: string;
  createdAt: Date;
  updatedAt: Date;
  user: { name: string; avatar: string };
  messages: Message[];
  /** The support agent / receiver this ticket is assigned to */
  receiverId: string;
}

export interface ApiTicketResponse {
  id?: string;
  ticketId?: string;
  createdAt?: string;
  updatedAt?: string;
  /** API uses NEW | OPEN | SOLVED | CANCEL */
  ticketStatus?: string;
  ticketName?: string;
  ticketDescription?: string;
  /** API uses HIGH | MEDIUM | LOW */
  priority?: string;
  department?: string;
  ticketReceiverId?: string;
  ticketCreatorId?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Status + Priority mappers
   API → UI
───────────────────────────────────────────────────────────────────────────── */
const API_STATUS_MAP: Record<string, TicketStatus> = {
  NEW: "pending",
  OPEN: "open",
  SOLVED: "solved",
  CANCEL: "cancelled",
};
const API_PRIORITY_MAP: Record<string, TicketPriority> = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

const mapApiToTicket = (api: ApiTicketResponse): Ticket => ({
  id: api.id ?? api.ticketId ?? "",
  title: api.ticketName ?? "Untitled",
  description: api.ticketDescription ?? "",
  status: API_STATUS_MAP[api.ticketStatus?.toUpperCase() ?? ""] ?? "pending",
  priority:
    API_PRIORITY_MAP[api.priority?.toUpperCase() ?? ""] ?? "medium",
  department: api.department ?? "GENERAL",
  createdAt: api.createdAt ? new Date(api.createdAt) : new Date(),
  updatedAt: api.updatedAt ? new Date(api.updatedAt) : new Date(),
  user: {
    name: "Me",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  messages: [],
  receiverId: api.ticketReceiverId ?? "",
});

/* ─────────────────────────────────────────────────────────────────────────────
   WebSocket URL
───────────────────────────────────────────────────────────────────────────── */
const WS_URL = "wss://api.sellapy.com";

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */
export default function TicketPage() {
  /* ── Auth ── */
  const authToken = useAppSelector(
    (state: RootState) => state.auth.access_token
  );
  const currentUserId = useAppSelector(
    (state: RootState) =>
      (state.auth as any).user?.id ?? (state.auth as any).userId ?? null
  );

  /* ── RTK Query ── */
  const {
    data: apiResp,
    isLoading,
    isError,
    refetch: refetchTickets,
  } = useGetAllTicketsQuery({ filter: "USER" });
  const [createTicketMutation, { isLoading: creating }] =
    useCreateTicketMutation();

  /* ── UI State ── */
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelectedRaw] = useState<Ticket | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  /* ── WebSocket ── */
  const hasJoinedApp = useRef(false);
  const joinedTicketId = useRef<string | null>(null);

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    authToken ? `${WS_URL}?token=${encodeURIComponent(authToken)}` : null,
    {
      // Keep the connection alive as long as the component is mounted.
      // shouldReconnect returning true is what prevents the "unexpected close".
      shouldReconnect: () => true,
      reconnectAttempts: 20,
      reconnectInterval: (attempt) =>
        // Exponential back-off: 1s, 2s, 4s … capped at 30s
        Math.min(1000 * 2 ** attempt, 30_000),
      onOpen: () => {
        // Reset flags so joinApp + joinTicketChat are re-sent after reconnect
        hasJoinedApp.current = false;
        joinedTicketId.current = null;
      },
      onClose: (event) => {
        // Code 1000 = normal closure (e.g. server side), everything else is
        // unexpected. Either way, shouldReconnect above will handle it.
        if (event.code !== 1000) {
          console.warn(`[WS] Unexpected close — code ${event.code}, reconnecting…`);
        }
        hasJoinedApp.current = false;
        joinedTicketId.current = null;
      },
      onError: (event) => {
        console.error("[WS] Error:", event);
      },
      // heartbeat keeps the connection from being killed by idle-timeout proxies
      heartbeat: {
        message: JSON.stringify({ type: "ping" }),
        returnMessage: JSON.stringify({ type: "pong" }),
        timeout: 60_000,   // expect pong within 60 s
        interval: 25_000,  // send ping every 25 s
      },
    }
  );

  const wsConnected = readyState === ReadyState.OPEN;

  /* ── Stable setSelected that keeps tickets array in sync ── */
  const setSelected = useCallback(
    (ticketOrUpdater: Ticket | null | ((prev: Ticket | null) => Ticket | null)) => {
      setSelectedRaw((prev) => {
        const next =
          typeof ticketOrUpdater === "function"
            ? ticketOrUpdater(prev)
            : ticketOrUpdater;
        return next;
      });
    },
    []
  );

  /* ── Fetch messages for the currently selected ticket ── */
  const { data: messagesData } = useGetSingleTicketMessageQuery(
    selected?.id,
    { skip: !selected?.id }
  );

  /* ── Sync API tickets → local state ── */
  useEffect(() => {
    if (!apiResp?.result?.data?.length) return;
    const mapped = apiResp.result.data.map(mapApiToTicket);
    setTickets(mapped);
    // Auto-select first ticket only on initial load (no ticket selected yet)
    setSelectedRaw((prev) => {
      if (prev) {
        // Keep selection but refresh its metadata (status, priority, etc.)
        const refreshed = mapped.find((t: Ticket) => t.id === prev.id);
        return refreshed ? { ...refreshed, messages: prev.messages } : prev;
      }
      return mapped[0] ?? null;
    });
  }, [apiResp]);

  /* ── Populate messages from API when selected ticket changes ── */
  useEffect(() => {
    if (!messagesData) return;

    // Support both { result: [...] } and { result: { data: [...] } }
    const raw: any[] = Array.isArray(messagesData.result)
      ? messagesData.result
      : messagesData.result?.data ?? [];

    const uiMessages: Message[] = raw.map((m: any) => ({
      id: m.id,
      content: m.content ?? "",
      timestamp: new Date(m.createdAt),
      // If the message was sent by the logged-in user → isSupport = false
      isSupport: currentUserId ? m.senderId !== currentUserId : false,
      attachments: m.attachments ?? [],
      senderId: m.senderId,
    }));

    setSelected((prev) =>
      prev ? { ...prev, messages: uiMessages } : prev
    );
  }, [messagesData, currentUserId]);

  /* ── WebSocket: join app + join ticket room on connect / ticket change ── */
  useEffect(() => {
    if (!wsConnected) return;

    // 1. Join the app namespace (only once per connection)
    if (!hasJoinedApp.current) {
      sendMessage(JSON.stringify({ type: "joinApp" }));
      hasJoinedApp.current = true;
    }

    // 2. Join the specific ticket chat room when selection changes
    if (selected?.id && joinedTicketId.current !== selected.id) {
      sendMessage(
        JSON.stringify({ type: "joinTicketChat", ticketId: selected.id })
      );
      joinedTicketId.current = selected.id;
    }
  }, [wsConnected, selected?.id, sendMessage]);

  /* ── WebSocket: handle incoming messages ── */
  useEffect(() => {
    if (!lastMessage?.data) return;
    try {
      const data = JSON.parse(lastMessage.data as string);

      if (data.type === "receiveTicketMessage") {
        const incomingTicketId: string = data.ticketId ?? selected?.id;
        if (!incomingTicketId) return;

        const msg: Message = {
          id: data.messageId ?? `ws_${Date.now()}`,
          content: data.content ?? "",
          timestamp: new Date(data.timestamp ?? Date.now()),
          // Message is from support if sender is NOT the current user
          isSupport: currentUserId
            ? data.senderId !== currentUserId
            : true,
          attachments: data.attachments ?? [],
          senderId: data.senderId,
        };

        // Update both the flat tickets array and the selected state
        setTickets((prev) =>
          prev.map((t) =>
            t.id === incomingTicketId
              ? { ...t, messages: [...t.messages, msg], updatedAt: new Date() }
              : t
          )
        );
        setSelected((prev) =>
          prev?.id === incomingTicketId
            ? { ...prev, messages: [...prev.messages, msg], updatedAt: new Date() }
            : prev
        );
      }

      // Server acknowledged our sent message — we can dedup the optimistic one
      if (data.type === "messageSent" && data.tempId) {
        setSelected((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === data.tempId
                ? { ...m, id: data.messageId ?? m.id }
                : m
            ),
          };
        });
      }
    } catch (e) {
      console.warn("[WS] Failed to parse message:", e);
    }
  }, [lastMessage, currentUserId, selected?.id]);

  /* ─────────────────── Handlers ─────────────────── */

  /**
   * Create a new ticket via the API, then add it to local state.
   * The second argument `prebuiltTicket` is kept for backwards compat with
   * CreateTicketModal's current signature but is no longer the primary path.
   */
  const handleCreate = async (
    form: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "user" | "messages" | "receiverId">,
    _prebuilt?: ApiTicketResponse
  ) => {
    try {
      const payload = {
        ticketName: form.title,
        ticketDescription: form.description,
        priority: form.priority.toUpperCase(),
        department: form.department,
      };
      const res = await createTicketMutation(payload).unwrap();

      // API may return the new ticket in different shapes
      const newApi: ApiTicketResponse =
        res?.result?.data?.[0] ??
        res?.result ??
        {};

      const newTicket: Ticket = {
        ...form,
        id: newApi.id ?? newApi.ticketId ?? Date.now().toString(),
        createdAt: newApi.createdAt ? new Date(newApi.createdAt) : new Date(),
        updatedAt: newApi.updatedAt ? new Date(newApi.updatedAt) : new Date(),
        status:
          API_STATUS_MAP[newApi.ticketStatus?.toUpperCase() ?? ""] ?? "pending",
        user: {
          name: "Me",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        messages: [],
        receiverId: newApi.ticketReceiverId ?? "",
      };

      setTickets((prev) => [newTicket, ...prev]);
      setSelected(newTicket);
      setModalOpen(false);
    } catch (e) {
      console.error("Create ticket failed:", e);
    }
  };

  /**
   * Optimistically update ticket status in both lists.
   * You can wire this to an RTK mutation as needed.
   */
  const updateStatus = (id: string, status: TicketStatus) => {
    const now = new Date();
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, updatedAt: now } : t))
    );
    setSelected((prev) =>
      prev?.id === id ? { ...prev, status, updatedAt: now } : prev
    );
  };

  /**
   * Send a message over WebSocket and optimistically add it to local state.
   * Falls back gracefully if WS is not yet connected.
   */
  const handleSendMessage = useCallback(
    (ticketId: string, content: string, atts?: Attachment[]) => {
      if (!content.trim() && !atts?.length) return;

      if (!wsConnected) {
        console.warn("[WS] Not connected — message queued locally only.");
      }

      const tempId = `temp_${Date.now()}`;

      // Send over WebSocket
      if (wsConnected && selected) {
        sendMessage(
          JSON.stringify({
            type: "sendTicketMessage",
            ticketId,
            receiverId: selected.receiverId,
            content,
            tempId, // lets us reconcile the optimistic msg with the ack
          })
        );
      }

      // Optimistic UI update
      const msg: Message = {
        id: tempId,
        content,
        timestamp: new Date(),
        isSupport: false,
        attachments: atts,
        senderId: currentUserId ?? undefined,
      };

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, messages: [...t.messages, msg], updatedAt: new Date() }
            : t
        )
      );
      setSelected((prev) =>
        prev?.id === ticketId
          ? { ...prev, messages: [...prev.messages, msg], updatedAt: new Date() }
          : prev
      );
    },
    [wsConnected, selected, sendMessage, currentUserId]
  );

  /* ── Derived ── */
  const selectedReceiverId = useMemo(
    () => selected?.receiverId ?? null,
    [selected?.receiverId]
  );

  const connectionStatus = useMemo(() => {
    switch (readyState) {
      case ReadyState.CONNECTING: return { label: "Connecting…", color: "#faad14" };
      case ReadyState.OPEN:       return { label: "Connected",   color: "#52c41a" };
      case ReadyState.CLOSING:    return { label: "Closing…",    color: "#faad14" };
      case ReadyState.CLOSED:     return { label: "Offline",     color: "#ff4d4f" };
      default:                    return { label: "Unknown",     color: "#d9d9d9" };
    }
  }, [readyState]);

  /* ─────────────────── Render ─────────────────── */
  if (isLoading)
    return (
      <div className="flex h-[80vh] items-center justify-center bg-gray-50">
        <p className="text-gray-500 animate-pulse">Loading tickets…</p>
      </div>
    );

  if (isError)
    return (
      <div className="flex h-[80vh] items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-red-600 font-medium">Failed to load tickets.</p>
          <button
            onClick={() => refetchTickets()}
            className="text-sm text-blue-600 underline hover:text-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );

  return (
    <div className="flex h-[80vh] bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <header className="p-4 border-b border-gray-200 space-y-2">
          <Button
            onClick={() => setModalOpen(true)}
            className="w-full"
            variant="outline"
            disabled={creating}
          >
            <Plus className="w-4 h-4 mr-2" />
            {creating ? "Creating…" : "Create new ticket"}
          </Button>

          {/* Connection indicator */}
          <div className="flex items-center gap-1.5 px-1">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: connectionStatus.color }}
            />
            <span className="text-xs text-gray-500">{connectionStatus.label}</span>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto">
          <TicketList
            tickets={tickets}
            selectedTicket={selected}
            onSelectTicket={setSelected}
          />
        </section>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <TicketDetail
            ticket={selected}
            receiverId={selectedReceiverId}
            onUpdateStatus={updateStatus}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-1">
              <p className="text-gray-400 text-4xl">📭</p>
              <p className="text-gray-500 font-medium">No ticket selected</p>
              <p className="text-gray-400 text-sm">
                Pick one from the list or create a new ticket
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ── Create Modal ── */}
      <CreateTicketModal
        isOpen={modalOpen}
        onCreateTicket={handleCreate}
        onClose={() => setModalOpen(false)}
        createTicketMutation={createTicketMutation}
      />
    </div>
  );
}