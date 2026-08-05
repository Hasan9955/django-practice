"use client";
import { useGetMyProductOrdersQuery } from "@/redux/features/product/productApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Skeleton, Select, Input } from "antd";
import {
  CalendarOutlined,
  DownOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUpdateOrderStatusMutation } from "@/redux/features/payment/paymentApi";

interface OrderData {
  id: string;
  orderNumber: string;
  price: number;
  quantity: number;
  currency: string;
  region: string;
  deliveryAddress: string | null;
  createdAt: string;
  orderStatus: string;
  isReviewed: boolean;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  variant: {
    id: string;
    sku: string;
    product: {
      id: string;
      productName: string;
      productPhoto: string[];
    };
  } | null;
}

// Returns only the valid NEXT statuses from the current status
const getNextStatuses = (currentStatus: string): string[] => {
  switch (currentStatus) {
    case "Pending":
      return ["Accepted", "Rejected"];
    case "Accepted":
      return ["Shipped", "Rejected"];
    case "Shipped":
      return ["Delivered", "Rejected"];
    case "Delivered":
      return ["Refunded"];
    case "Rejected":
    case "Refunded":
      return []; // Terminal states — no further transitions
    default:
      return [];
  }
};

// Returns a styled badge for the current order status
const StatusBadge = ({ status }: { status: string }) => {
  const colorMap: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Accepted: "bg-blue-100 text-blue-700",
    Shipped: "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Refunded: "bg-gray-100 text-gray-600",
  };
  const cls = colorMap[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${cls}`}>
      {status}
    </span>
  );
};

const OrderList = () => {
  const user = useAppSelector((state: RootState) => state?.auth?.user);
  const userId = user?.id;
  const { data, isLoading, refetch } = useGetMyProductOrdersQuery(userId);
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const orderData = data?.result?.data || [];
  const router = useRouter();

  const [deletedOrderIds, setDeletedOrderIds] = useState<string[]>([]);
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const tabs = [
    { label: "New order request", status: "Pending" },
    { label: "Accepted", status: "Accepted" },
    { label: "Rejected", status: "Rejected" },
    { label: "Shipped", status: "Shipped" },
    { label: "Delivered", status: "Delivered" },
    { label: "Refunded", status: "Refunded" },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0].status);

  const filteredOrders = orderData.filter(
    (order: OrderData) => !deletedOrderIds.includes(order.id),
  );

  const displayedOrders = filteredOrders
    .filter((order: OrderData) => order.orderStatus === activeTab)
    .filter((order: OrderData) =>
      (order.variant?.product?.productName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );

  const sortedOrders: OrderData[] = displayedOrders
    .slice()
    .sort((a: OrderData, b: OrderData) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  if (isLoading) {
    return <Skeleton active />;
  }

  const handleStatusChange = (order: OrderData, newStatus: string) => {
    if (newStatus === order.orderStatus) return;
    setUpdatingIds((prev) => [...prev, order.id]);
    updateOrderStatus({ orderId: order.id, status: newStatus })
      .unwrap()
      .then(() => {
        if (newStatus === "Rejected") {
          setDeletedOrderIds((prev) => [...prev, order.id]);
        }
        refetch();
      })
      .catch((err) => console.error("Error updating status:", err))
      .finally(() =>
        setUpdatingIds((prev) => prev.filter((id) => id !== order.id)),
      );
  };

  const handleSearch = () => {
    setSearchTerm(inputValue);
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-5 pb-4">
          <h1 className="text-3xl font-bold text-black">Order Management</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-medium">Sort by</span>
            <button
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full bg-white hover:bg-gray-50"
              onClick={() =>
                setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
              }
            >
              <CalendarOutlined />
              Date ({sortOrder.toUpperCase()})
              <DownOutlined />
            </button>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="flex justify-between items-center px-6 pb-4">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.status}
                onClick={() => setActiveTab(tab.status)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  activeTab === tab.status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center">
            <Input
              placeholder="Search by product name"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSearch}
              className="w-64 rounded-full mr-2"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b font-inter border-gray-200">
                <th className="text-left py-5 px-6 text-base text-[#5F6368] font-medium">
                  Product Name
                </th>
                <th className="text-left py-5 px-6 text-base text-[#5F6368] font-medium">
                  Location
                </th>
                <th className="text-left py-5 px-6 text-base text-[#5F6368] font-medium">
                  Order ID
                </th>
                <th className="text-left py-5 px-6 text-base text-[#5F6368] font-medium">
                  Order Status
                </th>
                <th className="text-left py-5 px-6 text-base text-[#5F6368] font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order: OrderData) => {
                const nextStatuses = getNextStatuses(order.orderStatus);
                return (
                  <tr
                    key={order.id}
                    className="border-b font-inter border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* Product Name */}
                    <td
                      className="py-4 px-6 text-base text-[#5F6368] truncate max-w-xs cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/order-list/${order.id}`)
                      }
                    >
                      {order.variant?.product?.productName || "N/A"}
                    </td>

                    {/* Location */}
                    <td
                      className="py-4 px-6 text-base text-[#5F6368] cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/order-list/${order.id}`)
                      }
                    >
                      {order.region}
                    </td>

                    {/* Order ID */}
                    <td
                      className="py-4 px-6 text-base text-[#5F6368] cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/order-list/${order.id}`)
                      }
                    >
                      {order.id}
                    </td>

                    {/* Current Status Badge */}
                    <td className="py-4 px-6">
                      <StatusBadge status={order.orderStatus} />
                    </td>

                    {/* Action — only show next valid statuses */}
                    <td className="py-4 px-6">
                      {nextStatuses.length === 0 ? (
                        <span className="text-gray-400 text-sm italic">
                          No actions
                        </span>
                      ) : (
                        <Select
                          placeholder="Change status"
                          onChange={(value) =>
                            handleStatusChange(order, value)
                          }
                          loading={updatingIds.includes(order.id)}
                          suffixIcon={<DownOutlined />}
                          popupMatchSelectWidth={false}
                        >
                          {nextStatuses.map((status) => (
                            <Select.Option key={status} value={status}>
                              {status}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {sortedOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">No orders found</div>
        )}
      </div>
    </div>
  );
};

export default OrderList;