/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import SellerCard from "@/components/ui/Card/B2BCard";
import { Select, DatePicker, Input, Pagination, Modal } from "antd";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Image from "next/image";
import { Table } from "@/components/ui/Table/Table";
import {
  useGetB2bDashboardStaticQuery,
  useGetB2BChartAdminDataQuery,
  useGetB2BAdminListingsQuery,
} from "@/redux/features/dashborad/b2bProtal/b2bProtalApi";

dayjs.extend(customParseFormat);

const { Search } = Input;
const dateFormatList = ["DD/MM/YYYY", "DD/MM/YY", "DD-MM-YYYY", "DD-MM-YY"];

// ─── Skeleton Components ──────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="animate-pulse flex-1 rounded-xl border border-[#E5EAEB] p-6 flex flex-col gap-3">
    <div className="h-4 bg-gray-200 rounded w-1/2" />
    <div className="h-8 bg-gray-200 rounded w-1/3" />
    <div className="h-3 bg-gray-200 rounded w-2/3" />
  </div>
);

const ChartSkeleton = () => (
  <div className="animate-pulse rounded-[12px] border border-[#E5EAEB] w-3/5 h-[388px] p-6 flex flex-col gap-6">
    <div className="flex justify-between items-center">
      <div className="h-5 bg-gray-200 rounded w-1/3" />
      <div className="h-8 bg-gray-200 rounded w-28" />
    </div>
    <div className="flex items-end gap-3 h-full pb-6">
      {[65, 40, 80, 30, 55, 70, 45].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-200 rounded-t"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  </div>
);

const TopSellerSkeleton = () => (
  <div className="animate-pulse rounded-[12px] border border-[#E5EAEB] w-2/5 h-[388px] p-6">
    <div className="flex justify-between mb-3">
      <div className="h-5 bg-gray-200 rounded w-1/3" />
      <div className="h-8 bg-gray-200 rounded w-28" />
    </div>
    <div className="h-px bg-gray-200 my-3 mb-6" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-10" />
      </div>
    ))}
  </div>
);

const TableRowSkeleton = () => (
  <div className="animate-pulse flex items-center gap-6 px-4 py-4 border-b border-gray-100">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-10 h-10 bg-gray-200 rounded-full" />
      <div className="h-4 bg-gray-200 rounded w-24" />
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    ))}
    <div className="h-8 bg-gray-200 rounded w-16" />
  </div>
);

const TableSkeleton = () => (
  <div className="w-full rounded-xl border border-[#E5EAEB] overflow-hidden">
    {/* Header */}
    <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 border-b border-gray-200">
      {["Seller", "Items", "Contact", "Amount", "Upload date", "Status", "Details"].map((h) => (
        <div key={h} className="flex-1 h-4 bg-gray-200 rounded w-1/2" />
      ))}
    </div>
    {[...Array(5)].map((_, i) => (
      <TableRowSkeleton key={i} />
    ))}
  </div>
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface OfferItem {
  id: string;
  quantity: number;
  unitPrice: number;
}

interface ListingRow {
  id: string;
  totalPrice: number;
  createdAt: string;
  expectedDeliveryDate: string;
  offerStuts: string;
  isDelivered: boolean;
  offer_Items: OfferItem[];
  seller: { id: string; fullName: string; profileImage: string };
  buyer: { id: string; fullName: string; phoneNumber: string };
}

// ─── Main Component ───────────────────────────────────────────────────────────
const B2BInsights = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState<string | undefined>(undefined);

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingRow | null>(null);

  // ── RTK Queries ────────────────────────────────────────────────────────────
  const { data: staticData, isLoading: staticLoading } =
    useGetB2bDashboardStaticQuery({});

  const { data: chartApiData, isLoading: chartLoading } =
    useGetB2BChartAdminDataQuery({});

  const { data: listingApiData, isLoading: listingLoading } =
    useGetB2BAdminListingsQuery({ page, limit, month, search });

  // ── Derived Data ───────────────────────────────────────────────────────────
  const staticResult = staticData?.result;
  const topSellers = staticResult?.topSellers ?? [];
  const chartResult = chartApiData?.result ?? [];
  const listings = listingApiData?.result?.data ?? [];
  const meta = listingApiData?.result?.meta;

  // Cards built from static API
  const sellerCards = [
    {
      title: "Total Sellers",
      value: staticResult?.totalSellers ?? 0,
      totalSellers: staticResult?.totalSellers ?? 0,
      icon: () => <span></span>,
      subbgicon: "#E8F0FE",
      bgicon: "#1C6EE6",
    },
    {
      title: "Total Contracts",
      value: staticResult?.totalContracts ?? 0,
      totalSellers: staticResult?.totalContracts ?? 0,
      icon: () => <span></span>,
      subbgicon: "#FEF3E8",
      bgicon: "#F59E0B",
    },
    {
      title: "Running Contracts",
      value: staticResult?.runningContacts ?? 0,
      totalSellers: staticResult?.runningContacts ?? 0,
      icon: () => <span></span>,
      subbgicon: "#E8FEF3",
      bgicon: "#10B981",
    },
  ];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleMonthChange = (_: any, dateString: string | string[]) => {
    setMonth(typeof dateString === "string" ? dateString : dateString[0]);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSearchClear = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setSearch("");
      setPage(1);
    }
  };

  const handleViewDetails = (row: ListingRow) => {
    setSelectedListing(row);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  const percentageFormatter = (value: number) => `${value}%`;

  // ── Table Columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      header: "Seller",
      accessor: "seller",
      className: "pl-4 pr-12",
      render: (row: ListingRow) => (
        <div className="flex items-center gap-3">
          <Image
            src={
              row.seller?.profileImage ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt={row.seller?.fullName ?? "seller"}
            width={40}
            height={40}
            className="w-10 h-10 object-cover rounded-full shrink-0"
          />
          <span className="font-medium text-[#322F35]">{row.seller?.fullName}</span>
        </div>
      ),
    },
    {
      header: "Items",
      accessor: "offer_Items",
      className: "px-12",
      render: (row: ListingRow) => (
        <span className="text-[#5C595E]">{row.offer_Items?.length ?? 0} items</span>
      ),
    },
    {
      header: "Contact",
      accessor: "contact",
      className: "px-12",
      render: (row: ListingRow) => (
        <span className="text-[#5C595E]">{row.buyer?.phoneNumber ?? "—"}</span>
      ),
    },
    {
      header: "Amount",
      accessor: "totalPrice",
      className: "px-12",
      render: (row: ListingRow) => (
        <span className="font-semibold text-[#322F35]">
          ${row.totalPrice?.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Upload date",
      accessor: "createdAt",
      className: "px-12",
      render: (row: ListingRow) => (
        <span className="text-[#5C595E]">
          {dayjs(row.createdAt).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "offerStuts",
      className: "px-12",
      render: (row: ListingRow) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            row.offerStuts === "ACCEPTED"
              ? "bg-green-100 text-green-700"
              : row.offerStuts === "PENDING"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.offerStuts}
        </span>
      ),
    },
    {
      header: "Details",
      accessor: "details",
      className: "px-2",
      render: (row: ListingRow) => (
        <button
          className="rounded-[8px] bg-black/20 hover:bg-black/10 px-2 py-1 text-black font-inter text-base transition-colors"
          onClick={() => handleViewDetails(row)}
        >
          View
        </button>
      ),
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl my-6 bg-white flex p-6 flex-col items-start gap-10 w-full">
      {/* ── Top Cards ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between w-full gap-6">
        {staticLoading
          ? [1, 2, 3].map((i) => <CardSkeleton key={i} />)
          : sellerCards.map((card, i) => <SellerCard key={i} {...card} />)}
      </div>

      {/* ── Chart + Top Sellers ────────────────────────────────────────────── */}
      <div className="flex gap-6 w-full">
        {/* Chart */}
        {chartLoading ? (
          <ChartSkeleton />
        ) : (
          <div className="rounded-[12px] border border-[#E5EAEB] w-3/5 h-[388px] p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between w-full">
              <h4 className="text-black text-lg font-medium">Contract insights</h4>
              <Select
                placeholder="Select period"
                defaultValue="week"
                options={[
                  { value: "week", label: "This Week" },
                  { value: "month", label: "This Month" },
                  { value: "year", label: "This Year" },
                ]}
              />
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartResult}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={percentageFormatter} />
                <Tooltip formatter={(value: number) => [`${value}`, "Amount"]} />
                <Legend />
                <Bar dataKey="amount" name="Amount" fill="#1C6EE6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Sellers */}
        {staticLoading ? (
          <TopSellerSkeleton />
        ) : (
          <div className="rounded-[12px] border border-[#E5EAEB] w-2/5 h-[388px] p-6">
            <div className="flex justify-between w-full">
              <h5 className="text-black text-lg font-medium">Top seller</h5>
              <DatePicker
                defaultValue={dayjs("01/01/2025", dateFormatList[0])}
                format={dateFormatList}
                onChange={handleMonthChange}
                picker="month"
              />
            </div>

            <div className="bg-[#EAECF0] h-[1px] w-full mt-3 mb-6" />

            <div className="w-full overflow-y-auto max-h-[260px] pr-1">
              {topSellers.length === 0 ? (
                <p className="text-center text-gray-400 mt-10 text-sm">No sellers found</p>
              ) : (
                topSellers.map((seller: any, index: number) => (
                  <div key={index} className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          seller.profileImage ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt={seller.fullName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <h3 className="text-[#322F35] text-lg font-semibold">{seller.fullName}</h3>
                    </div>

                    <p className="text-[#5C595E] text-sm">
                      {seller.acceptedContracts} contracts
                    </p>

                    <span className="text-[#5C595E] text-sm font-semibold">
                      #{seller.id.slice(-4)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Listings Table ─────────────────────────────────────────────────── */}
      <div className="w-full flex flex-col gap-4">
        {/* Search bar */}
        <div className="flex items-center justify-between">
          <h4 className="text-black text-lg font-medium">All Listings</h4>
          <Search
            placeholder="Search by seller, buyer…"
            allowClear
            onSearch={handleSearch}
            onChange={handleSearchClear}
            className="w-64"
          />
        </div>

        {/* Table or skeleton */}
        {listingLoading ? (
          <TableSkeleton />
        ) : listings.length === 0 ? (
          <div className="w-full py-16 flex flex-col items-center gap-2 text-gray-400 border border-[#E5EAEB] rounded-xl">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5M3.75 12h.008v.008H3.75V12zm4.5 0h.008v.008h-.008V12zm4.5 0h.008v.008h-.008V12z" />
            </svg>
            <p className="text-sm">No listings found</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={listings} />

            {/* Pagination */}
            {meta && meta.total > limit && (
              <div className="flex justify-end mt-2">
                <Pagination
                  current={page}
                  pageSize={limit}
                  total={meta.total}
                  onChange={(p) => setPage(p)}
                  showSizeChanger={false}
                  showTotal={(total, range) =>
                    `${range[0]}–${range[1]} of ${total} listings`
                  }
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Details Modal ─────────────────────────────────────────────────────── */}
      <Modal
        title="Listing Details"
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        centered
      >
        {selectedListing && (
          <div className="space-y-6">
            {/* Seller & Buyer Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-gray-500 mb-2">SELLER</h5>
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      selectedListing.seller.profileImage ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt={selectedListing.seller.fullName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-lg">{selectedListing.seller.fullName}</p>
                    <p className="text-sm text-gray-500">ID: {selectedListing.seller.id}</p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-500 mb-2">BUYER</h5>
                <div>
                  <p className="font-semibold">{selectedListing.buyer.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedListing.buyer.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* Contract Summary */}
            <div className="grid grid-cols-3 gap-4 border border-gray-200 rounded-xl p-4">
              <div>
                <p className="text-xs text-gray-500">TOTAL AMOUNT</p>
                <p className="text-2xl font-semibold text-[#322F35]">
                  ${selectedListing.totalPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">UPLOAD DATE</p>
                <p className="text-lg font-medium">
                  {dayjs(selectedListing.createdAt).format("DD MMM YYYY")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">EXPECTED DELIVERY</p>
                <p className="text-lg font-medium">
                  {dayjs(selectedListing.expectedDeliveryDate).format("DD MMM YYYY")}
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-gray-500 mb-1">STATUS</p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  selectedListing.offerStuts === "ACCEPTED"
                    ? "bg-green-100 text-green-700"
                    : selectedListing.offerStuts === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {selectedListing.offerStuts}
              </span>
            </div>

            {/* Items Table */}
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-3">OFFERED ITEMS</h5>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ITEM ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">QUANTITY</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">UNIT PRICE</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedListing.offer_Items.map((item) => (
                      <tr key={item.id} className="border-b last:border-none">
                        <td className="px-4 py-3 font-mono text-sm">{item.id}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">${item.unitPrice}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          ${(item.quantity * item.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delivered flag */}
            {selectedListing.isDelivered && (
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="text-xl">✅</span>
                <span className="font-medium">This contract has been marked as delivered</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default B2BInsights;