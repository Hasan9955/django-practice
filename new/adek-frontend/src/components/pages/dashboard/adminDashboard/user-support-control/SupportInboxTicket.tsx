/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Tabs,
  Avatar,
  Tag,
  Button,
  Input,
  Upload,
  List,
  Typography,
  Space,
  Modal,
  App,
  Spin,
  Badge,
  Tooltip,
  Empty,
} from "antd";
import {
  DownloadOutlined,
  PaperClipOutlined,
  UserOutlined,
  CloseOutlined,
  FileTextOutlined,
  SendOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ArrowLeftOutlined,
  MailOutlined,
} from "@ant-design/icons";
import type { TabsProps, UploadProps, UploadFile } from "antd";
import Image from "next/image";
import useWebSocket, { ReadyState } from "react-use-websocket";
import {
  useGetAllTicketConversationsQuery,
  useGetSingleTicketMessageQuery,
  useTicketMessagesAsReadMutation,
  useUpdateTicketStatusMutation,
} from "@/redux/features/ticket/ticketApi";
import { RootState } from "@/redux/store";
import { useAppSelector } from "@/redux/hooks";

const { TextArea } = Input;
const { Text, Title } = Typography;

const WS_URL = "wss://api.sellapy.com";

interface Attachment {
  name: string;
  url: string;
  type: "pdf" | "doc" | "image";
  size?: number;
  uid: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  sender: "user" | "agent";
  senderName: string;
  senderId?: string;
}

interface TicketCreator {
  id: string;
  fullName: string;
  profileImage: string;
  email: string;
}

interface TicketData {
  id: string;
  ticketName: string;
  ticketDescription: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  department: "SALES" | "TECHNICAL" | "FINANCE";
  ticketStatus: "NEW" | "OPEN" | "SOLVED" | "CANCEL";
  tickerRole: string;
  ticketCreatorId: string;
  ticketReceiverId: string;
  createdAt: string;
  updatedAt: string;
  ticketCreator?: TicketCreator;
}

// ─── Relative time formatter ─────────────────────────────────────────────────
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000); // seconds
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── Reusable profile avatar ──────────────────────────────────────────────────
function ProfileAvatar({
  creator,
  size = 40,
  className = "",
  fallbackColor = "from-blue-500 to-indigo-600",
}: {
  creator?: TicketCreator;
  size?: number;
  className?: string;
  fallbackColor?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (creator?.profileImage && !imgError) {
    return (
      <Avatar
        size={size}
        src={creator.profileImage}
        alt={creator.fullName}
        className={`flex-shrink-0 ring-2 ring-white shadow-md ${className}`}
        onError={() => {
          setImgError(true);
          return false;
        }}
      />
    );
  }

  // Show initials if we have a name
  if (creator?.fullName) {
    const initials = creator.fullName
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    return (
      <Avatar
        size={size}
        className={`flex-shrink-0 bg-gradient-to-br ${fallbackColor} ring-2 ring-white shadow-md font-bold text-white ${className}`}
      >
        {initials}
      </Avatar>
    );
  }

  return (
    <Avatar
      size={size}
      icon={<UserOutlined />}
      className={`flex-shrink-0 bg-gradient-to-br ${fallbackColor} ring-2 ring-white shadow-md ${className}`}
    />
  );
}

// ─── Inline image attachment thumbnail ───────────────────────────────────────
function AttachmentItem({
  att,
  onPreview,
}: {
  att: Attachment;
  onPreview: (a: Attachment) => void;
}) {
  if (att.type === "image") {
    return (
      <div
        className="relative cursor-pointer rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        style={{ width: 120, height: 90 }}
        onClick={() => onPreview(att)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={att.url}
          alt={att.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
          <FileImageOutlined className="text-white text-lg opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    );
  }

  return (
    <Button
      size="small"
      icon={<FileTextOutlined />}
      onClick={() => onPreview(att)}
      className="rounded-xl border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-600 text-xs"
    >
      {att.name} <DownloadOutlined className="ml-1" />
    </Button>
  );
}

// ─── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({
  msg,
  ticket,
  onPreview,
}: {
  msg: Message;
  ticket: TicketData;
  onPreview: (a: Attachment) => void;
}) {
  const isAgent = msg.sender === "agent";

  return (
    <div
      className={`flex gap-2.5 ${isAgent ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 self-end mb-1">
        <ProfileAvatar
          creator={isAgent ? undefined : ticket.ticketCreator}
          size={32}
          fallbackColor={
            isAgent
              ? "from-violet-500 to-blue-600"
              : "from-emerald-400 to-teal-600"
          }
        />
      </div>

      {/* Bubble content */}
      <div
        className={`flex flex-col gap-1 min-w-0 ${
          isAgent ? "items-end" : "items-start"
        }`}
        style={{ maxWidth: "72%" }}
      >
        {/* Name + time */}
        <div
          className={`flex items-center gap-2 flex-wrap ${
            isAgent ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <Text strong className="text-xs text-gray-700 leading-tight">
            {msg.senderName}
          </Text>
          {isAgent && (
            <Tag
              color="blue"
              className="px-1.5 py-0 text-xs rounded-full font-semibold m-0 leading-tight"
              style={{ fontSize: "10px" }}
            >
              Support
            </Tag>
          )}
          <Text
            type="secondary"
            className="text-gray-400"
            style={{ fontSize: "10px" }}
          >
            {relativeTime(msg.timestamp)}
          </Text>
        </div>

        {/* Text bubble */}
        {msg.content && (
          <div
            className={`px-3.5 py-2.5 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words ${
              isAgent
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-sm"
                : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
            }`}
          >
            {msg.content}
          </div>
        )}

        {/* Attachments */}
        {msg.attachments && msg.attachments.length > 0 && (
          <div
            className={`flex flex-wrap gap-2 mt-1 ${
              isAgent ? "justify-end" : "justify-start"
            }`}
          >
            {msg.attachments.map((att, i) => (
              <AttachmentItem key={i} att={att} onPreview={onPreview} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
function SupportTicketContent() {
  const { message } = App.useApp();
  const { data: ticketsResponse, isLoading } =
    useGetAllTicketConversationsQuery({});
  const [updateTicketStatus] = useUpdateTicketStatusMutation();
  const [markAsRead] = useTicketMessagesAsReadMutation();

  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [showConv, setShowConv] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [activeTab, setActiveTab] = useState("buyer");
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasJoinedApp = useRef(false);
  const currentTicketId = useRef<string | null>(null);

  const authToken = useAppSelector(
    (state: RootState) => state.auth.access_token,
  );
  // ── Get the current logged-in user's ID so we can correctly label agent vs user ──
  const currentUserId = useAppSelector(
    (state: RootState) =>
      (state.auth as any).user?.id ?? (state.auth as any).userId ?? null,
  );

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    authToken ? `${WS_URL}?token=${encodeURIComponent(authToken)}` : null,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
      onOpen: () => {
        hasJoinedApp.current = false;
      },
      onClose: () => {
        hasJoinedApp.current = false;
      },
    },
  );

  const wsConnected = readyState === ReadyState.OPEN;

  const getConnectionStatus = () => {
    switch (readyState) {
      case ReadyState.CONNECTING:
        return { text: "Connecting…", color: "processing" };
      case ReadyState.OPEN:
        return { text: "Connected", color: "success" };
      case ReadyState.CLOSING:
        return { text: "Closing…", color: "warning" };
      case ReadyState.CLOSED:
        return { text: "Offline", color: "error" };
      default:
        return { text: "Unknown", color: "default" };
    }
  };

  const { data: ticketMessagesData } = useGetSingleTicketMessageQuery(
    selectedTicket?.id,
    { skip: !selectedTicket },
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (wsConnected && !hasJoinedApp.current) {
      sendMessage(JSON.stringify({ type: "joinApp" }));
      hasJoinedApp.current = true;
      if (selectedTicket) {
        sendMessage(
          JSON.stringify({
            type: "joinTicketChat",
            ticketId: selectedTicket.id,
          }),
        );
        currentTicketId.current = selectedTicket.id;
      }
    }
  }, [wsConnected, selectedTicket, sendMessage]);

  useEffect(() => {
    if (!lastMessage) return;
    try {
      const data = JSON.parse(lastMessage.data);
      if (data.type === "receiveTicketMessage") {
        const isFromCreator = data.senderId === selectedTicket?.ticketCreatorId;
        const isFromCurrentUser =
          currentUserId && data.senderId === currentUserId;
        setMessages((prev) => [
          ...prev,
          {
            id: data.messageId || `msg_${Date.now()}`,
            content: data.content,
            timestamp: data.timestamp || new Date().toISOString(),
            sender: isFromCreator && !isFromCurrentUser ? "user" : "agent",
            senderName:
              data.senderName ||
              (isFromCreator
                ? selectedTicket?.ticketCreator?.fullName ?? "User"
                : "Support Agent"),
            senderId: data.senderId,
            attachments: data.attachments ?? [],
          },
        ]);
        message.success("New message received");
      }
    } catch {
      /* ignore */
    }
  }, [lastMessage, selectedTicket, currentUserId]);

  useEffect(() => {
    if (
      selectedTicket &&
      wsConnected &&
      currentTicketId.current !== selectedTicket.id
    ) {
      sendMessage(
        JSON.stringify({ type: "joinTicketChat", ticketId: selectedTicket.id }),
      );
      currentTicketId.current = selectedTicket.id;
      markAsRead({ ticketId: selectedTicket.id });
    }
  }, [selectedTicket, wsConnected, sendMessage, markAsRead]);

  // ── Map API messages → local Message[] ────────────────────────────────────
  // The API returns `senderId` but no `senderName`. We determine direction by:
  //   - If senderId === ticketCreatorId  → "user"  (the person who opened the ticket)
  //   - Otherwise                        → "agent" (support staff)
  useEffect(() => {
    if (!ticketMessagesData?.result) return;

    // API wraps results in either .result.data (paginated) or .result (array)
    const raw: any[] = Array.isArray(ticketMessagesData.result)
      ? ticketMessagesData.result
      : ticketMessagesData.result?.data ?? [];

    setMessages(
      raw.map((msg: any) => {
        const isCreator = msg.senderId === selectedTicket?.ticketCreatorId;
        // If we have the current user's ID, use it; otherwise fall back to creator check
        const isAgentMsg = currentUserId
          ? msg.senderId === currentUserId
          : !isCreator;

        return {
          id: msg.id,
          content: msg.content ?? "",
          // Keep raw ISO string so relativeTime() can parse it
          timestamp: msg.createdAt,
          sender: isAgentMsg ? "agent" : "user",
          senderName: isAgentMsg
            ? "Support Agent"
            : selectedTicket?.ticketCreator?.fullName ?? "User",
          senderId: msg.senderId,
          attachments: msg.attachments ?? [],
        };
      }),
    );
  }, [ticketMessagesData, selectedTicket, currentUserId]);

  const tickets = ticketsResponse?.result?.data || [];

  const filteredTickets = tickets.filter((t: TicketData) =>
    activeTab === "buyer"
      ? t.tickerRole === "BUYER" || t.tickerRole === "ALL"
      : t.tickerRole === "SELLER" || t.tickerRole === "ALL",
  );

  const buyerCount = tickets.filter(
    (t: TicketData) => t.tickerRole === "BUYER" || t.tickerRole === "ALL",
  ).length;
  const sellerCount = tickets.filter(
    (t: TicketData) => t.tickerRole === "SELLER" || t.tickerRole === "ALL",
  ).length;

  const tabItems: TabsProps["items"] = [
    {
      key: "buyer",
      label: (
        <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
          🛒 Buyer{" "}
          <Badge
            count={buyerCount}
            showZero
            color="#3b82f6"
            style={{ fontSize: "10px" }}
          />
        </span>
      ),
    },
    {
      key: "seller",
      label: (
        <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
          🏪 Seller{" "}
          <Badge
            count={sellerCount}
            showZero
            color="#10b981"
            style={{ fontSize: "10px" }}
          />
        </span>
      ),
    },
  ];

  const statusColor = (s: string) =>
    ({ OPEN: "#1890ff", NEW: "#52c41a", SOLVED: "#8c8c8c", CANCEL: "#ff4d4f" }[
      s
    ] ?? "#d9d9d9");
  const statusIcon = (s: string) =>
    ({
      OPEN: <ClockCircleOutlined />,
      NEW: <SyncOutlined spin />,
      SOLVED: <CheckCircleOutlined />,
      CANCEL: <CloseOutlined />,
    }[s] ?? null);
  const priorityColor = (p: string) =>
    ({ HIGH: "#ff4d4f", MEDIUM: "#faad14", LOW: "#52c41a" }[p] ?? "#d9d9d9");

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      if (
        !file.type.includes("image") &&
        !file.type.includes("pdf") &&
        !file.type.includes("document")
      ) {
        message.error("Only images, PDFs, or documents!");
        return false;
      }
      if (file.size! / 1024 / 1024 >= 10) {
        message.error("File must be < 10 MB!");
        return false;
      }
      setUploadedFiles((prev) => [...prev, file]);
      return false;
    },
    onRemove: (file) =>
      setUploadedFiles((prev) => prev.filter((f) => f.uid !== file.uid)),
    fileList: uploadedFiles,
    multiple: true,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: false,
    },
    onPreview: (file) => {
      if (file.type?.includes("image")) {
        setPreviewImage(file.url || file.thumbUrl || "");
        setPreviewVisible(true);
      }
    },
  };

  const handleSendMessage = async () => {
    if (!replyText.trim() && !uploadedFiles.length) {
      message.warning("Enter a message or attach a file");
      return;
    }
    if (!selectedTicket) {
      message.error("No ticket selected");
      return;
    }
    if (!wsConnected) {
      message.error("Not connected – please wait…");
      return;
    }
    setIsSending(true);
    try {
      sendMessage(
        JSON.stringify({
          type: "sendTicketMessage",
          ticketId: selectedTicket.id,
          receiverId: selectedTicket.ticketCreatorId,
          content: replyText,
        }),
      );
      // Optimistically add the sent message
      setMessages((prev) => [
        ...prev,
        {
          id: `temp_${Date.now()}`,
          content: replyText,
          timestamp: new Date().toISOString(),
          sender: "agent",
          senderName: "Support Agent",
          attachments: uploadedFiles.map((f) => ({
            name: f.name,
            url: f.url || "#",
            type: f.type?.includes("image")
              ? "image"
              : f.type?.includes("pdf")
              ? "pdf"
              : "doc",
            size: f.size,
            uid: f.uid,
          })) as Attachment[],
        },
      ]);
      setReplyText("");
      setUploadedFiles([]);
      message.success("Message sent!");
    } catch {
      message.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleSolved = async () => {
    if (!selectedTicket) return;
    if (replyText.trim() || uploadedFiles.length) await handleSendMessage();
    try {
      await updateTicketStatus({
        ticketId: selectedTicket.id,
        status: "SOLVED",
      }).unwrap();
      message.success("Ticket marked as solved!");
      setSelectedTicket({ ...selectedTicket, ticketStatus: "SOLVED" });
    } catch {
      message.error("Failed to update ticket status");
    }
  };

  const handleSelectTicket = (ticket: TicketData) => {
    setSelectedTicket(ticket);
    setMessages([]); // clear stale messages while new ones load
    setShowConv(true);
  };

  const handlePreview = (a: Attachment) => {
    if (a.type === "image") {
      setPreviewImage(a.url);
      setPreviewVisible(true);
    } else {
      window.open(a.url, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center space-y-3">
          <Spin size="large" />
          <p className="text-gray-600 font-semibold text-sm">
            Loading support tickets…
          </p>
        </div>
      </div>
    );
  }

  const connStatus = getConnectionStatus();

  return (
    <div className="relative flex gap-3 sm:gap-4 xl:gap-6 h-screen p-3 sm:p-4 lg:p-5 xl:p-6 bg-white">
      {/* WS Status badge */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50">
        <Tooltip
          title={wsConnected ? "Connected" : "Disconnected – reconnecting…"}
        >
          <Tag
            color={connStatus.color as any}
            icon={
              wsConnected ? (
                <CheckCircleOutlined />
              ) : readyState === ReadyState.CONNECTING ? (
                <SyncOutlined spin />
              ) : (
                <CloseOutlined />
              )
            }
            className="px-2.5 py-1 text-xs font-bold shadow-lg border-0 uppercase tracking-wide"
          >
            <span className="hidden sm:inline">{connStatus.text}</span>
          </Tag>
        </Tooltip>
      </div>

      {/* ── Ticket List Panel ── */}
      <div
        className={`
        flex flex-col bg-white shadow-xl border border-gray-100 overflow-hidden rounded-2xl lg:rounded-3xl
        w-full h-full
        lg:w-[360px] xl:w-[400px] 2xl:w-[440px] lg:flex-shrink-0
        ${showConv ? "hidden lg:flex" : "flex"}
      `}
      >
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-0 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50 flex-shrink-0">
          <Title
            level={4}
            className="m-0 text-gray-900 font-bold text-base sm:text-lg mb-3 sm:mb-4"
          >
            📬 Support Tickets
          </Title>
          <Tabs
            items={tabItems}
            activeKey={activeTab}
            onChange={setActiveTab}
            size="small"
            className="-mx-4 sm:-mx-6 px-4 sm:px-6"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 sm:p-3">
          {filteredTickets.length === 0 ? (
            <Empty description="No tickets found" className="mt-16" />
          ) : (
            <List
              dataSource={filteredTickets}
              renderItem={(ticket: TicketData) => {
                const isSelected = selectedTicket?.id === ticket.id;
                return (
                  <List.Item
                    className={`cursor-pointer transition-all duration-200 mx-1 mb-2.5 rounded-2xl ${
                      isSelected
                        ? "bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 shadow-md border-2 border-blue-300"
                        : "bg-gray-50 hover:bg-white hover:shadow-sm border border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ padding: "12px 14px" }}
                    onClick={() => handleSelectTicket(ticket)}
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <ProfileAvatar
                            creator={ticket.ticketCreator}
                            size={38}
                          />
                          <div className="flex-1 min-w-0">
                            <Text
                              strong
                              className="text-xs sm:text-sm block text-gray-900 truncate leading-tight"
                            >
                              {ticket.ticketCreator?.fullName ??
                                ticket.ticketName}
                            </Text>
                            <Text className="text-xs text-gray-500 truncate block">
                              {ticket.ticketName}
                            </Text>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <Text
                            type="secondary"
                            className="text-xs text-gray-500 whitespace-nowrap"
                          >
                            {new Date(ticket.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                          </Text>
                          {ticket.ticketStatus === "NEW" && (
                            <Badge status="processing" />
                          )}
                        </div>
                      </div>

                      <Text
                        type="secondary"
                        className="text-xs block mb-2.5 leading-snug line-clamp-2 text-gray-600"
                      >
                        {ticket.ticketDescription}
                      </Text>

                      <Space size={4} wrap>
                        <Tag
                          color={statusColor(ticket.ticketStatus)}
                          icon={statusIcon(ticket.ticketStatus)}
                          className="px-2 py-0 text-xs rounded-full font-semibold"
                        >
                          {ticket.ticketStatus}
                        </Tag>
                        <Tag
                          color={priorityColor(ticket.priority)}
                          className="px-2 py-0 text-xs rounded-full font-semibold"
                        >
                          {ticket.priority}
                        </Tag>
                        <Tag
                          color="blue"
                          className="px-2 py-0 text-xs rounded-full font-semibold"
                        >
                          {ticket.department}
                        </Tag>
                      </Space>
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      </div>

      {/* ── Conversation Panel ── */}
      <div
        className={`
        flex-col bg-white shadow-xl border border-gray-100 overflow-hidden rounded-2xl lg:rounded-3xl
        w-full h-full lg:flex-1
        ${showConv ? "flex" : "hidden lg:flex"}
      `}
      >
        {selectedTicket ? (
          <>
            {/* ── Conversation Header ── */}
            <div className="px-4 sm:px-6 lg:px-7 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-b from-white via-blue-50/40 to-white flex-shrink-0">
              <button
                className="lg:hidden flex items-center gap-1.5 text-blue-600 font-semibold text-sm mb-3 hover:text-blue-700 transition-colors"
                onClick={() => setShowConv(false)}
              >
                <ArrowLeftOutlined className="text-xs" />
                All Tickets
              </button>

              {selectedTicket.ticketCreator && (
                <div className="flex items-center gap-3 mb-3 px-3 py-2.5 bg-blue-50 rounded-2xl">
                  <ProfileAvatar
                    creator={selectedTicket.ticketCreator}
                    size={38}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate leading-tight">
                      {selectedTicket.ticketCreator.fullName}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                      <MailOutlined className="flex-shrink-0" />
                      {selectedTicket.ticketCreator.email}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between gap-2 mb-2.5">
                <Title
                  level={4}
                  className="m-0 text-gray-900 font-bold leading-tight !text-sm sm:!text-base lg:!text-lg"
                >
                  {selectedTicket.ticketName}
                </Title>
                {selectedTicket.ticketStatus === "NEW" && (
                  <span className="animate-pulse bg-red-500 rounded-full w-2.5 h-2.5 flex-shrink-0 mt-1.5" />
                )}
              </div>

              <Space size={6} wrap>
                <Tag
                  color={statusColor(selectedTicket.ticketStatus)}
                  icon={statusIcon(selectedTicket.ticketStatus)}
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                >
                  {selectedTicket.ticketStatus}
                </Tag>
                <Tag
                  color={priorityColor(selectedTicket.priority)}
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                >
                  {selectedTicket.priority} Priority
                </Tag>
                <Tag
                  color="blue"
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                >
                  {selectedTicket.department}
                </Tag>
              </Space>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 px-4 sm:px-6 py-5 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Empty
                    description={
                      <span className="text-gray-400 text-sm">
                        No messages yet — start the conversation!
                      </span>
                    }
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:gap-5">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      ticket={selectedTicket}
                      onPreview={handlePreview}
                    />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Reply Box ── */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 flex-shrink-0">
              <div className="flex items-center gap-2.5 mb-3">
                <ProfileAvatar
                  creator={selectedTicket.ticketCreator}
                  size={30}
                />
                <div>
                  <Text
                    strong
                    className="text-gray-900 text-xs sm:text-sm block leading-tight"
                  >
                    Reply to{" "}
                    <span className="text-blue-600">
                      {selectedTicket.ticketCreator?.fullName ??
                        "Ticket Creator"}
                    </span>
                  </Text>
                  {selectedTicket.ticketCreator?.email && (
                    <Text
                      type="secondary"
                      className="text-xs text-gray-500 block"
                    >
                      {selectedTicket.ticketCreator.email}
                    </Text>
                  )}
                </div>
              </div>

              <TextArea
                placeholder="Write your reply here…"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  // Ctrl/Cmd + Enter to send
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter")
                    handleSendMessage();
                }}
                rows={3}
                className="mb-3 rounded-2xl text-sm resize-none"
                disabled={!wsConnected || isSending}
                style={{ borderColor: "#e5e7eb" }}
              />

              <div className="mb-3">
                <Upload {...uploadProps}>
                  <Button
                    icon={<PaperClipOutlined />}
                    disabled={!wsConnected || isSending}
                    size="small"
                    className="rounded-xl border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 text-xs"
                  >
                    Attach Files
                  </Button>
                </Upload>
                {uploadedFiles.length > 0 && (
                  <Text
                    type="secondary"
                    className="text-xs text-gray-600 block mt-1"
                  >
                    ✓ {uploadedFiles.length} file
                    {uploadedFiles.length !== 1 ? "s" : ""} attached
                  </Text>
                )}
              </div>

              <div className="flex flex-wrap justify-between items-center gap-2">
                <Text
                  type="secondary"
                  className="text-xs text-gray-400 hidden sm:block"
                >
                  Ctrl + Enter to send
                </Text>
                <div className="flex flex-wrap gap-2 ml-auto">
                  <Button
                    size="small"
                    disabled={isSending}
                    onClick={() => {
                      setReplyText("");
                      setUploadedFiles([]);
                    }}
                    className="rounded-xl border border-gray-300 text-gray-700 text-xs px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!wsConnected || isSending}
                    loading={isSending}
                    className="rounded-xl bg-blue-500 hover:bg-blue-600 border-blue-500 text-white font-semibold text-xs px-4 shadow"
                  >
                    Send
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={handleSolved}
                    disabled={!wsConnected || isSending}
                    className="bg-green-500 hover:bg-green-600 border-green-500 rounded-xl font-semibold text-xs px-4 shadow"
                  >
                    Solved
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="text-5xl sm:text-6xl mb-4 opacity-80">📬</div>
              <Text className="text-base sm:text-lg font-semibold text-gray-800 block mb-1">
                No Ticket Selected
              </Text>
              <Text type="secondary" className="text-sm text-gray-500 block">
                Select a ticket from the list to view conversation details
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        title="Image Preview"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="90vw"
        style={{ maxWidth: 800 }}
      >
        <Image
          width={800}
          height={600}
          alt="preview"
          style={{ width: "100%", height: "auto" }}
          src={previewImage || "/placeholder.svg"}
        />
      </Modal>
    </div>
  );
}

export default function SupportInboxTicket() {
  return (
    <App>
      <SupportTicketContent />
    </App>
  );
}
