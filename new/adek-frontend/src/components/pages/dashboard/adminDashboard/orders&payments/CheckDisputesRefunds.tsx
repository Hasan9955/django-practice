/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paperclip, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent } from "@/components/ui/Card/Cards";
import { Avatar } from "@/components/ui/Avatar/avatar";
import { OpneChart } from "@/assets/svgIcon";
import Image from "next/image";
import TextArea from "antd/es/input/TextArea";
import { RootState } from "@/redux/store";
import { useAppSelector } from "@/redux/hooks";

// Type Definitions
interface RefundConversation {
  refundConversationId: string;
  refundReason: string;
  refundStatus: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  type: string;
  participants: {
    user: {
      id: string;
      profileImage: string;
      fullName: string;
    };
    seller: {
      id: string;
      profileImage: string;
      fullName: string;
    };
  };
  productId: string;
  productName: string;
  productImage: string[];
  productPrice: number;
  orderNumber: string;
  lastMessage: string;
  lastMessageTime: string;
  unseen: number;
}

interface RefundMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string;
  imageUrl?: string;
  conversationId: string | null;
  ticketId: string | null;
  refundId: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WSMessage {
  type: string;
  refundId?: string;
  receiverId?: string;
  content?: string;
  imageUrl?: string;
  message?: RefundMessage;
  error?: string;
}

export default function AdminRefundDashboard() {
  // Auth
  const token = useAppSelector((state: RootState) => state.auth.access_token);
  const currentUserId = useAppSelector(
    (state: RootState) => state.auth.user?.id,
  );

  console.log("🔑 [ADMIN] Current User ID:", currentUserId);

  // State
  const [conversations, setConversations] = useState<RefundConversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<RefundConversation | null>(null);
  const [messages, setMessages] = useState<RefundMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [defenseNote, setDefenseNote] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Track current refund ID
  const currentRefundId = useRef<string | null>(null);
  const hasJoinedApp = useRef(false);

  // WebSocket setup with react-use-websocket
  const socketUrl = token
    ? `wss://api.sellapy.com?token=${encodeURIComponent(token)}`
    : null;

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketUrl,
    {
      shouldReconnect: () => true, // Always attempt to reconnect
      reconnectAttempts: 10, // Try 10 times before giving up
      reconnectInterval: (attemptNumber) =>
        Math.min(Math.pow(2, attemptNumber) * 1000, 10000), // Exponential backoff, max 10s
      heartbeat: {
        message: JSON.stringify({ type: "ping" }),
        returnMessage: "pong",
        timeout: 60000, // 60 seconds
        interval: 25000, // Send heartbeat every 25 seconds
      },
      onOpen: () => {
        console.log("✅ [ADMIN WS] Connected");
        hasJoinedApp.current = false; // Reset join status
      },
      onClose: (event) => {
        console.warn("⚠️ [ADMIN WS] Closed:", event.code, event.reason);
        hasJoinedApp.current = false;
        currentRefundId.current = null;
      },
      onError: (error) => {
        console.error("❌ [ADMIN WS] Error:", error);
      },
    },
    !!token, // Only connect if token exists
  );

  // Handle WebSocket connection state changes
  useEffect(() => {
    if (readyState === ReadyState.OPEN && !hasJoinedApp.current) {
      // Join app when connection opens
      const joinMsg = { type: "joinApp" };
      console.log("📤 [ADMIN] Sending:", joinMsg);
      sendJsonMessage(joinMsg);
      hasJoinedApp.current = true;

      // Rejoin current refund chat if exists
      if (currentRefundId.current) {
        const rejoinMsg = {
          type: "joinRefundChat",
          refundId: currentRefundId.current,
        };
        console.log("📤 [ADMIN] Rejoining refund chat:", rejoinMsg);
        sendJsonMessage(rejoinMsg);
      }
    }
  }, [readyState, sendJsonMessage]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastJsonMessage) {
      const data = lastJsonMessage as WSMessage;
      console.log("📨 [ADMIN] Received:", data);

      if (data.type === "receiveRefundMessage" && data.message) {
        const receivedMsg = data.message;
        receivedMsg.content = formatContent(receivedMsg.content);
        handleIncomingMessage(receivedMsg);
      } else if (data.type === "error") {
        console.error("❌ [ADMIN] Error:", data.error);
      }
    }
  }, [lastJsonMessage]);

  const formatContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed.refundReason) {
        return `Refund Request Created\nReason: ${parsed.refundReason}\nProduct: ${parsed.productName}\nOrder: ${parsed.orderNumber}`;
      }
    } catch {
      // not JSON
    }
    return content;
  };

  // Handle incoming message
  const handleIncomingMessage = useCallback(
    (message: RefundMessage) => {
      console.log("💬 [ADMIN] Processing incoming message:", message);

      if (message.refundId === selectedConversation?.refundConversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) {
            console.log("⚠️ [ADMIN] Duplicate message, skipping");
            return prev;
          }
          console.log("✅ [ADMIN] Adding new message to state");
          return [...prev, message];
        });
      } else {
        console.log(
          "📩 [ADMIN] Message for another conversation, refreshing list",
        );
      }

      // Refresh conversations list to update last message
      fetchConversations();
    },
    [selectedConversation],
  );

  // Fetch conversations
  const fetchConversations = async () => {
    if (!token) return;

    setIsLoadingConversations(true);
    try {
      console.log("📋 [ADMIN] Fetching conversations...");
      const response = await fetch(
        "https://api.sellapy.com/api/v1/refund/refund-conversation-list-for-admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      console.log("✅ [ADMIN] Conversations received:", data);

      if (data.success) {
        setConversations(data.result.result || []);
      }
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (refundConversationId: string) => {
    if (!token) return;

    setIsLoadingMessages(true);
    try {
      console.log("💬 [ADMIN] Fetching messages for:", refundConversationId);
      const response = await fetch(
        `https://api.sellapy.com/api/v1/refund/get-single-refund-message/${refundConversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      console.log("✅ [ADMIN] Messages received:", data);

      if (data.success) {
        const formattedMessages = data.result?.map((m: RefundMessage) => ({
          ...m,
          content: formatContent(m.content),
        }));
        setMessages(formattedMessages || []);
      }
    } catch (error) {
      console.error("❌ [ADMIN] Error fetching messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Join refund chat
  const joinRefundChat = useCallback(
    (refundId: string) => {
      if (readyState === ReadyState.OPEN) {
        const joinMsg = {
          type: "joinRefundChat",
          refundId: refundId,
        };
        console.log("📤 [ADMIN] Joining refund chat:", joinMsg);
        sendJsonMessage(joinMsg);
        currentRefundId.current = refundId;
      }
    },
    [readyState, sendJsonMessage],
  );

  // Send message via WebSocket
  const sendWebSocketMessage = useCallback(
    async (content: string, file?: File) => {
      if (!selectedConversation || readyState !== ReadyState.OPEN) {
        console.warn(
          "⚠️ [ADMIN] Cannot send message: not connected or no conversation selected",
        );
        return;
      }

      let imageUrl: string | undefined;

      if (file) {
        const uploadedUrl = await uploadFile(file);
        imageUrl = uploadedUrl === null ? undefined : uploadedUrl;
      }

      // IMPORTANT: Admin sends to SELLER, not user
      const payload = {
        type: "sendRefundMessage",
        refundId: selectedConversation.refundConversationId,
        receiverId: selectedConversation.participants.seller.id, // Send to SELLER
        content: content,
        ...(imageUrl && { imageUrl }),
      };

      console.log("📤 [ADMIN] Sending message:", payload);
      sendJsonMessage(payload);

      // Optimistically add to UI
      const optimisticMessage: RefundMessage = {
        id: `temp-${Date.now()}`,
        senderId: currentUserId || "admin",
        receiverId: selectedConversation.participants.seller.id,
        content: content,
        messageType: "REFUNDMESSAGE",
        imageUrl: imageUrl,
        conversationId: null,
        ticketId: null,
        refundId: selectedConversation.refundConversationId,
        read: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("✅ [ADMIN] Adding optimistic message:", optimisticMessage);
      setMessages((prev) => [...prev, optimisticMessage]);
    },
    [selectedConversation, readyState, sendJsonMessage, currentUserId],
  );

  // Update refund status
  const updateRefundStatus = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedConversation || !token) return;

    try {
      console.log("🔄 [ADMIN] Updating refund status:", {
        refundId: selectedConversation.refundConversationId,
        status,
      });

      const response = await fetch(
        "https://api.sellapy.com/api/v1/refund/update-refund-status",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refundId: selectedConversation.refundConversationId,
            status: status,
          }),
        },
      );
      const data = await response.json();
      console.log("✅ [ADMIN] Status updated:", data);

      if (data.success) {
        // Send notification message to seller
        const statusMessage =
          status === "APPROVED"
            ? "✅ Refund request has been approved by admin."
            : "❌ Refund request has been rejected by admin.";
        sendWebSocketMessage(statusMessage);

        // Refresh conversations
        fetchConversations();
      }
    } catch (error) {
      console.error("❌ [ADMIN] Error updating refund status:", error);
    }
  };

  // Upload file
  const uploadFile = async (file: File): Promise<string | null> => {
    if (!token) return null;

    setIsUploadingFile(true);
    try {
      console.log("📎 [ADMIN] Uploading file:", file.name);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://api.sellapy.com/api/v1/chat/chat-image-upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );
      const data = await response.json();
      console.log("✅ [ADMIN] File uploaded:", data);
      return data.data || null;
    } catch (error) {
      console.error("❌ [ADMIN] Error uploading file:", error);
      return null;
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation: RefundConversation) => {
    console.log(
      "🎯 [ADMIN] Selected conversation:",
      conversation.refundConversationId,
    );
    setSelectedConversation(conversation);
    setMessages([]);
    fetchMessages(conversation.refundConversationId);
    joinRefundChat(conversation.refundConversationId);
  };

  // Handle send message
  const handleSendMessage = () => {
    if (messageInput.trim() && selectedConversation) {
      console.log("📤 [ADMIN] Sending quick message:", messageInput);
      sendWebSocketMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("📎 [ADMIN] File selected:", file.name);
      setSelectedFile(file);
    }
  };

  // Handle send defense request
  const handleSendDefenseRequest = async () => {
    if (!defenseNote.trim() && !selectedFile) return;

    sendWebSocketMessage(defenseNote.trim(), selectedFile ?? undefined);

    setDefenseNote("");
    setSelectedFile(null);
  };

  // Initialize conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Format helpers
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  // Get connection status
  const getConnectionStatus = () => {
    switch (readyState) {
      case ReadyState.CONNECTING:
        return {
          status: "connecting",
          label: "🟡 Connecting...",
          color: "bg-yellow-100 text-yellow-700",
        };
      case ReadyState.OPEN:
        return {
          status: "connected",
          label: "🟢 Connected",
          color: "bg-green-100 text-green-700",
        };
      case ReadyState.CLOSING:
        return {
          status: "disconnecting",
          label: "🟠 Closing...",
          color: "bg-orange-100 text-orange-700",
        };
      case ReadyState.CLOSED:
        return {
          status: "disconnected",
          label: "🔴 Disconnected",
          color: "bg-red-100 text-red-700",
        };
      default:
        return {
          status: "unknown",
          label: "⚪ Unknown",
          color: "bg-gray-100 text-gray-700",
        };
    }
  };

  const connectionInfo = getConnectionStatus();
  const isConnected = readyState === ReadyState.OPEN;
  const openConversations = conversations.filter(
    (c) => c.refundStatus === "PENDING",
  );

  console.log("📊 [ADMIN] Current state:", {
    conversations: conversations.length,
    selectedConversation: selectedConversation?.refundConversationId,
    messages: messages.length,
    connectionStatus: connectionInfo.status,
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Connection Status */}
      <div className="absolute top-2 right-2 z-50">
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${connectionInfo.color}`}
        >
          {connectionInfo.label}
        </div>
      </div>

      {/* Left Sidebar - Conversations */}
      <div className="w-80 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-200 bg-blue-50"
            >
              <div className="mr-2">
                <OpneChart />
              </div>
              Open ({openConversations.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 bg-transparent"
              onClick={fetchConversations}
              disabled={isLoadingConversations}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isLoadingConversations ? "animate-spin" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-2">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">No refund requests</div>
              </div>
            ) : (
              conversations.map((conversation) => (
                <Card
                  key={conversation.refundConversationId}
                  className={`mb-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedConversation?.refundConversationId ===
                    conversation.refundConversationId
                      ? "border-orange-200 bg-orange-50"
                      : ""
                  }`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div
                          className={`py-1 px-3 rounded-full inline-block mb-2 text-xs ${
                            conversation.refundStatus === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : conversation.refundStatus === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {conversation.refundStatus} •{" "}
                          {formatDate(conversation.lastMessageTime)}
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.refundReason}
                          </p>
                          {conversation.unseen > 0 && (
                            <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                              {conversation.unseen}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="w-4 h-4">
                            <Image
                              src={
                                conversation.participants.user.profileImage ||
                                "/placeholder.svg"
                              }
                              alt={conversation.participants.user.fullName}
                              width={16}
                              height={16}
                              className="w-full h-full rounded-full"
                            />
                          </Avatar>
                          <p className="text-xs text-gray-600">
                            {conversation.participants.user.fullName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="w-4 h-4">
                            <Image
                              src={
                                conversation.participants.seller.profileImage ||
                                "/placeholder.svg"
                              }
                              alt={conversation.participants.seller.fullName}
                              width={16}
                              height={16}
                              className="w-full h-full rounded-full"
                            />
                          </Avatar>
                          <p className="text-xs text-blue-600">
                            Seller: {conversation.participants.seller.fullName}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          Order:{" "}
                          <span className="font-medium">
                            {conversation.orderNumber}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Product:{" "}
                          <span className="font-medium">
                            {conversation.productName}
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <Image
                      src={
                        selectedConversation.participants.user.profileImage ||
                        "/placeholder.svg"
                      }
                      alt={selectedConversation.participants.user.fullName}
                      width={40}
                      height={40}
                      className="w-full h-full rounded-full"
                    />
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedConversation.participants.user.fullName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Order: {selectedConversation.orderNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Seller</p>
                    <p className="text-sm font-medium">
                      {selectedConversation.participants.seller.fullName}
                    </p>
                  </div>
                  <Avatar className="w-8 h-8">
                    <Image
                      src={
                        selectedConversation.participants.seller.profileImage ||
                        "/placeholder.svg"
                      }
                      alt={selectedConversation.participants.seller.fullName}
                      width={32}
                      height={32}
                      className="w-full h-full rounded-full"
                    />
                  </Avatar>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading messages...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === currentUserId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          message.senderId === currentUserId
                            ? "bg-blue-500 text-white"
                            : message.senderId ===
                              selectedConversation.participants.seller.id
                            ? "bg-purple-100 text-purple-900 border border-purple-200"
                            : "bg-gray-100 text-gray-900"
                        } rounded-lg p-3`}
                      >
                        {message.senderId !== currentUserId && (
                          <p className="text-xs font-semibold mb-1">
                            {message.senderId ===
                            selectedConversation.participants.seller.id
                              ? "Seller"
                              : "Customer"}
                          </p>
                        )}
                        {message.imageUrl && (
                          <Image
                            src={message.imageUrl}
                            width={200}
                            height={200}
                            alt="attachment"
                            className="max-w-full rounded mb-2"
                          />
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Defense Request Section */}
            <div className="p-6 bg-white border-t">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Admin Actions
                  </h3>

                  <TextArea
                    placeholder="Write notes or message to seller..."
                    value={defenseNote}
                    onChange={(e) => setDefenseNote(e.target.value)}
                    className="mb-4 min-h-[100px]"
                  />

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <label
                        htmlFor="file-upload"
                        className="text-sm text-gray-600 cursor-pointer"
                      >
                        {isUploadingFile ? "Uploading..." : "Attach file"}
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploadingFile}
                      />
                    </div>
                    {selectedFile && (
                      <span className="text-sm text-green-600">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3 mb-4">
                    <Button
                      variant="outline"
                      className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      onClick={handleSendDefenseRequest}
                      disabled={
                        (!defenseNote.trim() && !selectedFile) ||
                        !isConnected ||
                        isUploadingFile
                      }
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send to Seller
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                      onClick={() => updateRefundStatus("REJECTED")}
                      disabled={selectedConversation.refundStatus !== "PENDING"}
                    >
                      Reject Refund
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateRefundStatus("APPROVED")}
                      disabled={selectedConversation.refundStatus !== "PENDING"}
                    >
                      Approve Refund
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">
                No conversation selected
              </p>
              <p className="text-sm">
                Select a refund request from the sidebar
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {selectedConversation && (
          <>
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Refund Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Refund ID</p>
                  <p className="font-medium text-xs">
                    {selectedConversation.refundConversationId.slice(-8)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Order Number</p>
                  <p className="font-medium">
                    {selectedConversation.orderNumber}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Product</p>
                  <p className="font-medium">
                    {selectedConversation.productName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Price</p>
                  <p className="font-medium">
                    ${selectedConversation.productPrice}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Reason</p>
                  <p className="font-medium">
                    {selectedConversation.refundReason}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Status</p>
                  <p
                    className={`font-medium ${
                      selectedConversation.refundStatus === "PENDING"
                        ? "text-yellow-600"
                        : selectedConversation.refundStatus === "APPROVED"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedConversation.refundStatus}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 mt-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Quick message to seller..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isConnected}
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !isConnected}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
