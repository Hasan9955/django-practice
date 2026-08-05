"use client";

import { Table } from "@/components/ui/Table/Table";
import { DatePicker, Skeleton, Modal } from "antd";
import Image from "next/image";
import { useState, useEffect } from "react";
import { SearchOutlined, CloseCircleOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { useGetSellerPaymentOrdersQuery, useSellerWithdrawalRequestStatusMutation } from "@/redux/features/payment/paymentApi";
import toast from "react-hot-toast";

const { RangePicker } = DatePicker;

export interface WithdrawalRequest {
  id: string;
  sellerId: string;
  amount: number;
  bankName: string;
  accountNo: string;
  accountName: string;
  sortCode: string | null;
  createdAt: string;
  status: "Pending" | "Approved" | "Rejected";
  seller: {
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImage: string;
  };
}

interface QueryParams {
  search?: string;
  startDate?: string;
  endDate?: string;
}

const InvoiceBilling = () => {
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build query params (strict typing)
  const queryParams: QueryParams = {};
  
  if (debouncedSearch) {
    queryParams.search = debouncedSearch;
  }

  if (dateRange && dateRange[0] && dateRange[1]) {
    queryParams.startDate = dateRange[0].format("YYYY-MM-DD");
    queryParams.endDate = dateRange[1].format("YYYY-MM-DD");
  }

  const { data, isLoading, refetch } = useGetSellerPaymentOrdersQuery(queryParams);

  const [updateStatus, { isLoading: isUpdating }] = useSellerWithdrawalRequestStatusMutation();

  const withdrawalRequests: WithdrawalRequest[] = data?.result?.data || [];
  const meta = data?.result?.meta;

  const handleStatusUpdate = async (requestId: string, status: "Approved" | "Rejected") => {
    try {
      await updateStatus({ requestId, status }).unwrap();
      toast.success(`Request ${status.toLowerCase()} successfully`);
      refetch();
    } catch (error: unknown) {
      const message = error && typeof error === "object" && "data" in error && error.data && typeof error.data === "object" && "message" in error.data
        ? (error.data as { message: string }).message
        : `Failed to ${status.toLowerCase()} request`;
      toast.error(message);
    }
  };

  const handleViewDetails = (row: WithdrawalRequest) => {
    setSelectedRequest(row);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedRequest(null);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleClearDateRange = () => {
    setDateRange(null);
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setDateRange(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-500";
      case "Rejected":
        return "bg-red-500";
      case "Pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const columns = [
    {
      header: "Seller Name",
      accessor: "sellerName",
      className: "pl-4 pr-12",
      render: (row: WithdrawalRequest) => {
        const sellerImageUrl = row.seller.profileImage || "/placeholder-avatar.png";
        const sellerName = row.seller.fullName;

        return (
          <div className="flex items-center">
            <Image
              src={sellerImageUrl}
              alt={sellerName}
              width={40}
              height={40}
              className="w-10 h-10 object-cover object-center rounded-full mr-4"
            />
            <div className="flex flex-col">
              <span className="font-semibold">{sellerName}</span>
              <span className="text-sm text-gray-500">{row.seller.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Amount",
      accessor: "amount",
      className: "px-6",
      render: (row: WithdrawalRequest) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: "Bank Name",
      accessor: "bankName",
      className: "px-6",
    },
    {
      header: "Account Number",
      accessor: "accountNo",
      className: "px-6",
      render: (row: WithdrawalRequest) => (
        <span className="font-mono text-sm">{row.accountNo}</span>
      ),
    },
    {
      header: "Account Name",
      accessor: "accountName",
      className: "px-6",
    },
    {
      header: "Status",
      accessor: "status",
      className: "px-6",
      render: (row: WithdrawalRequest) => (
        <span
          className={`px-3 py-1 inline-block rounded-full text-white font-medium text-sm ${getStatusColor(
            row.status
          )}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Request Date",
      accessor: "createdAt",
      className: "px-6",
      render: (row: WithdrawalRequest) => (
        <span className="text-sm text-gray-600">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      className: "px-6",
      render: (row: WithdrawalRequest) => (
        <div className="flex items-center gap-2">
          <button
            className="rounded-md bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 text-sm font-medium transition-colors"
            onClick={() => handleViewDetails(row)}
          >
            View
          </button>
          {row.status === "Pending" && (
            <>
              <button
                className="rounded-md bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                onClick={() => handleStatusUpdate(row.id, "Approved")}
                disabled={isUpdating}
              >
                Approve
              </button>
              <button
                className="rounded-md bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                onClick={() => handleStatusUpdate(row.id, "Rejected")}
                disabled={isUpdating}
              >
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-black font-sans text-2xl font-bold leading-normal">
            Withdrawal Requests
          </h2>
          <p className="text-gray-600 font-sans text-base font-medium leading-normal mt-1">
            Manage seller withdrawal requests
          </p>
          {meta && (
            <p className="text-sm text-gray-500 mt-2">
              Total Requests: {meta.total} | Page {meta.page} of {meta.totalPage}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              placeholder="Search by seller name, email, or bank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 h-12 rounded-lg border border-gray-300 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <CloseCircleOutlined
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={handleClearSearch}
              />
            )}
          </div>

          {/* Date Range Picker */}
          <div className="relative">
            <RangePicker
              className="border-gray-300 border h-12 rounded-lg"
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
              format="YYYY-MM-DD"
              placeholder={["Start Date", "End Date"]}
            />
          </div>

          {/* Clear All Filters Button */}
          {(searchTerm || dateRange) && (
            <button
              onClick={handleClearAllFilters}
              className="px-4 h-12 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <CloseCircleOutlined />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(debouncedSearch || dateRange) && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
          {debouncedSearch && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
              Search: &ldquo;{debouncedSearch}&rdquo;
              <CloseCircleOutlined
                className="cursor-pointer hover:text-blue-900"
                onClick={handleClearSearch}
              />
            </span>
          )}
          {dateRange && dateRange[0] && dateRange[1] && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
              Date: {dateRange[0].format("MMM D, YYYY")} - {dateRange[1].format("MMM D, YYYY")}
              <CloseCircleOutlined
                className="cursor-pointer hover:text-green-900"
                onClick={handleClearDateRange}
              />
            </span>
          )}
        </div>
      )}

      <div className="mt-8">
        {isLoading ? (
          <Skeleton active />
        ) : withdrawalRequests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">No withdrawal requests found</p>
          </div>
        ) : (
          <Table columns={columns} data={withdrawalRequests} />
        )}
      </div>

      {/* Details Modal – now shows ALL data from JSON row (including sortCode) */}
      <Modal
        title={
          <div className="text-xl font-bold">
            Withdrawal Request Details
          </div>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <button
            key="close"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium"
            onClick={handleCloseModal}
          >
            Close
          </button>,
          selectedRequest?.status === "Pending" && (
            <>
              <button
                key="approve"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium ml-2"
                onClick={() => {
                  if (selectedRequest) {
                    handleStatusUpdate(selectedRequest.id, "Approved");
                    handleCloseModal();
                  }
                }}
                disabled={isUpdating}
              >
                Approve
              </button>
              <button
                key="reject"
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium ml-2"
                onClick={() => {
                  if (selectedRequest) {
                    handleStatusUpdate(selectedRequest.id, "Rejected");
                    handleCloseModal();
                  }
                }}
                disabled={isUpdating}
              >
                Reject
              </button>
            </>
          ),
        ]}
        width={700}
      >
        {selectedRequest && (
          <div className="space-y-6 py-4">
            {/* Seller Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                Seller Information
              </h3>
              <div className="flex items-center mb-4">
                <Image
                  src={selectedRequest.seller.profileImage || "/placeholder-avatar.png"}
                  alt={selectedRequest.seller.fullName}
                  width={60}
                  height={60}
                  className="w-16 h-16 object-cover rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold text-lg">
                    {selectedRequest.seller.fullName}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {selectedRequest.seller.email}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {selectedRequest.seller.phoneNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Request Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                Request Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Request ID</p>
                  <p className="font-medium font-mono text-sm">
                    {selectedRequest.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold text-lg text-green-600">
                    {formatCurrency(selectedRequest.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`px-3 py-1 inline-block rounded-full text-white font-medium text-sm ${getStatusColor(
                      selectedRequest.status
                    )}`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Request Date</p>
                  <p className="font-medium">
                    {formatDate(selectedRequest.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Details – now includes sortCode (all JSON fields shown) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                Bank Account Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bank Name</p>
                  <p className="font-medium">{selectedRequest.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Name</p>
                  <p className="font-medium">{selectedRequest.accountName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="font-medium font-mono">
                    {selectedRequest.accountNo}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sort Code</p>
                  <p className="font-medium font-mono">
                    {selectedRequest.sortCode || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceBilling;