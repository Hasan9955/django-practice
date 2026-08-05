// src/components/ReturnsDisputeTable.tsx
"use client";

import Image from "next/image";
import { useGetSellerRefundConversationListQuery } from "@/redux/features/dashborad/sellerdashboard/sellerDashboardApi";
import { RefundConversation } from "@/types/refund";
import { Table } from "@/components/ui/Table/Table";

const ReturnsDisputeTable = ({ searchQuery }: { searchQuery: string }) => {
  const { data, isLoading } =
    useGetSellerRefundConversationListQuery(searchQuery);

  const conversations: RefundConversation[] = data?.result?.result || [];

  const columns = [
    {
      header: "User",
      accessor: "participants.username",
      render: (row: RefundConversation) => (
        <div className="flex items-center gap-3">
          <Image
            src={row.participants.image || "/default-avatar.png"}
            alt={row.participants.username}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <span className="font-medium">{row.participants.username}</span>
        </div>
      ),
    },
    {
      header: "Product",
      accessor: "productName",
      render: (row: RefundConversation) => (
        <div className="flex items-center gap-3">
          <Image
            src={row.productImage?.[0] || "/placeholder-product.jpg"}
            alt={row.productName}
            width={40}
            height={40}
            className="rounded object-cover"
          />
          <span>{row.productName}</span>
        </div>
      ),
    },
    {
      header: "Order Number",
      accessor: "orderNumber",
    },
    {
      header: "Reason",
      accessor: "refundReason",
    },
    {
      header: "Status",
      accessor: "refundStatus",
      render: (row: RefundConversation) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          {row.refundStatus}
        </span>
      ),
    },
    {
      header: "Last Message",
      accessor: "lastMessageTime",
      render: (row: RefundConversation) => (
        <span className="text-sm text-gray-600">
          {row.lastMessageTime
            ? new Date(row.lastMessageTime).toLocaleString()
            : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <Table
        columns={columns}
        data={conversations}
        isLoading={isLoading}
        emptyMessage="No pending return/dispute requests at the moment."
      />
    </div>
  );
};

export default ReturnsDisputeTable;
