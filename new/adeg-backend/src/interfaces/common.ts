import { IGenericErrorMessage } from "./error";


export type IGenericResponse<T> = {
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: T;
};

export type IGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorMessages: IGenericErrorMessage[];
};

export interface RedisMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: any;
  offerId?: string;
  imageUrl?: string;
  createdAt: string;
  read?: boolean;
  updatedAt?: string;
  conversationId: string;
  ticketId?: string;
  refundId?: string;
  chatType: "PRIVATEMESSAGE" | "B2B" | "OFFER";
  // messageType: "PRIVATEMESSAGE" | "B2B" | "TICKETMESSAGE" | "REFUNDMESSAGE";
}