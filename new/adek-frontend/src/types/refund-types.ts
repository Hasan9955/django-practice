// refund-types.ts — single source of truth for all refund-related types

export type RefundStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";

export interface RefundRequest {
  id: string; // refundConversationId
  refundReason: string;
  refundStatus: RefundStatus;
  productName: string;
  productImage: string[];
  orderNumber: string;
  userId: string;
  userName: string;
  userAvatar: string;
  createdAt: Date;
  lastMessage?: string;
  lastMessageTime?: string;
  unseen?: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  imageUrl?: string;
  timestamp: Date;
  type: "seller" | "customer";
}