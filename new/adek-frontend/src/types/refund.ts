// src/types/refund.ts
export interface Participant {
  userId: string;
  username: string;
  image: string;
}

export interface RefundConversation {
  refundConversationId: string;
  refundReason: string;
  refundStatus: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  type: "refund";
  participants: Participant;
  productId: string;
  productName: string;
  productImage: string[];
  orderNumber: string;
  lastMessage: string;
  lastMessageTime: string;
  unseen: number;
}

export interface RefundConversationResponse {
  success: boolean;
  message: string;
  result: {
    result: RefundConversation[];
    meta: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export type RefundConversationList = RefundConversation[];
