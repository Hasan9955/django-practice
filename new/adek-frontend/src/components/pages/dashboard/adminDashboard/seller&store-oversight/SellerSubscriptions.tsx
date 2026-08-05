/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React, { useState, useMemo } from "react";
// import { Select, DatePicker, Tag } from "antd";
// import Image from "next/image";
// import { Table } from "@/components/ui/Table/Table";
// import { Pagination } from "@/components/ui/Pagination/Pagination";
// import SubscriptionsModal from "@/components/ui/Modal/SubscriptionsModal/SubscriptionsModal";
// import { useGetSellerSubscritionPlansQuery } from "@/redux/features/dashborad/platform/platformManagementApi";

// const { RangePicker } = DatePicker;

// const ITEMS_PER_PAGE = 8;

// export type SellerDetails = {
//   name: string;
//   date: string;
//   product: string;
//   revenue: number;
//   runningPlan: string;
// };

// export type SellerSubscriptionsData = {
//   id: string;
//   imageUrl: string;
//   sellersName: string;
//   plane: string;
//   purchaseDate: string;
//   renewDate: string;
//   status: "ACTIVE" | "PENDING" | "DEACTIVE" | "FAILED";
//   details: SellerDetails;
// };

// const SellerSubscriptions = () => {
//   const { data } = useGetSellerSubscritionPlansQuery({ filter: "" });
//   const [currentPage, setCurrentPage] = useState(1);
//   const [statusFilter, setStatusFilter] = useState<
//     "ALL" | "ACTIVE" | "PENDING" | "DEACTIVE" | "FAILED"
//   >("ALL");
//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalData, setModalData] = useState<SellerSubscriptionsData | null>(
//     null,
//   );

//   // Map API data to component data
//   const sellerSubscriptionsData: SellerSubscriptionsData[] = useMemo(() => {
//     if (!data?.result?.data) return [];
//     return data.result.data.map((item: any) => ({
//       id: item.id,
//       imageUrl: item.user.profileImage || "/default-avatar.png",
//       sellersName: item.user.fullName,
//       plane: item.subscription.title,
//       purchaseDate: new Date(item.startDate).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       }),
//       renewDate: new Date(item.endDate).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       }),
//       status: item.status,
//       details: {
//         name: item.user.fullName,
//         date: new Date(item.startDate).toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//         }),
//         product: item.subscription.title,
//         revenue: item.subscription.price,
//         runningPlan: item.subscription.title,
//       },
//     }));
//   }, [data]);

//   // Filter by status
//   const filteredData = useMemo(() => {
//     return sellerSubscriptionsData.filter((item) =>
//       statusFilter === "ALL" ? true : item.status === statusFilter,
//     );
//   }, [sellerSubscriptionsData, statusFilter]);

//   // Pagination logic
//   const paginatedData = useMemo(() => {
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
//   }, [filteredData, currentPage]);

//   const handleViewDetails = (row: SellerSubscriptionsData) => {
//     setModalData(row);
//     setModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setModalOpen(false);
//     setModalData(null);
//   };

//   const columns = [
//     {
//       header: "Seller Name",
//       accessor: "sellersName",
//       className: "pl-4 pr-12",
//       render: (row: SellerSubscriptionsData) => (
//         <div className="flex items-center gap-4">
//           <Image
//             src={row.imageUrl}
//             alt={row.sellersName}
//             width={80}
//             height={80}
//             className="w-10 h-10 object-cover rounded-full border border-gray-200"
//           />
//           <span className="font-medium text-gray-900">{row.sellersName}</span>
//         </div>
//       ),
//     },
//     {
//       header: "Plan",
//       accessor: "plane",
//       className: "px-12",
//     },
//     {
//       header: "Purchase Date",
//       accessor: "purchaseDate",
//       className: "px-12",
//     },
//     {
//       header: "Renew Date",
//       accessor: "renewDate",
//       className: "px-12",
//     },
//     {
//       header: "Status",
//       accessor: "status",
//       className: "px-4",
//       render: (row: SellerSubscriptionsData) => {
//         const statusMap: Record<
//           string,
//           { color: "success" | "warning" | "default" | "error"; label: string }
//         > = {
//           ACTIVE: { color: "success", label: "Active" },
//           PENDING: { color: "warning", label: "Pending" },
//           DEACTIVE: { color: "default", label: "Inactive" },
//           FAILED: { color: "error", label: "Failed" },
//         };

//         const config = statusMap[row.status] || statusMap.FAILED;

//         return (
//           <Tag
//             color={config.color}
//             className="px-5 py-1.5 text-xs font-semibold rounded-3xl flex items-center justify-center min-w-[92px] shadow-sm"
//           >
//             {config.label}
//           </Tag>
//         );
//       },
//     },
//     {
//       header: "Details",
//       accessor: "details",
//       className: "px-4 text-right",
//       render: (row: SellerSubscriptionsData) => (
//         <button
//           onClick={() => handleViewDetails(row)}
//           className="inline-flex items-center gap-2 rounded-xl bg-[#00286B] px-6 py-2.5 text-white text-sm font-semibold hover:bg-[#001F4F] transition-colors"
//         >
//           View Details
//         </button>
//       ),
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Header & Filters */}
//       <div className="flex justify-between items-end">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
//             Seller Subscriptions
//           </h2>
//           <p className="text-base text-gray-600 mt-1">
//             Manage all seller subscription plans
//           </p>
//         </div>

//         <div className="flex items-center gap-4">
//           {/* Ant Design RangePicker */}
//           <RangePicker
//             className="h-12 border border-gray-300 rounded-xl hover:border-gray-400 focus:border-blue-500"
//             placeholder={["Start Date", "End Date"]}
//             style={{ width: 280 }}
//           />

//           {/* Ant Design Select */}
//           <Select
//             value={statusFilter}
//             onChange={(value) =>
//               setStatusFilter(
//                 value as "ALL" | "ACTIVE" | "PENDING" | "DEACTIVE" | "FAILED",
//               )
//             }
//             style={{ width: 180, height: 48 }}
//             className="rounded-xl"
//             options={[
//               { value: "ALL", label: "All Status" },
//               { value: "ACTIVE", label: "Active" },
//               { value: "PENDING", label: "Pending" },
//               { value: "DEACTIVE", label: "Inactive" },
//               { value: "FAILED", label: "Failed" },
//             ]}
//             dropdownStyle={{ borderRadius: "12px" }}
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
//         <Table
//           columns={columns}
//           data={paginatedData}
//           emptyMessage="No subscriptions found matching your criteria"
//         />
//       </div>

//       {/* Pagination */}
//       <div className="flex justify-end">
//         <Pagination
//           currentPage={currentPage}
//           totalPages={Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
//           onPageChange={setCurrentPage}
//           itemsPerPage={ITEMS_PER_PAGE}
//           totalItems={filteredData.length}
//         />
//       </div>

//       {/* Modal */}
//       {modalData && (
//         <SubscriptionsModal
//           modalData={modalData}
//           open={modalOpen}
//           onCancel={handleCloseModal}
//         />
//       )}
//     </div>
//   );
// };

// export default SellerSubscriptions;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import { Select, DatePicker, Tag, Spin, Skeleton } from "antd";
import Image from "next/image";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import SubscriptionsModal from "@/components/ui/Modal/SubscriptionsModal/SubscriptionsModal";
import { useGetAllSubscribedsellersritionQuery } from "@/redux/features/dashborad/platform/platformManagementApi";

const { RangePicker } = DatePicker;

type StatusFilter = "ALL" | "ACTIVE" | "PENDING" | "DEACTIVE" | "FAILED";

export type SellerDetails = {
  name: string;
  email: string;
  date: string;
  product: string;
  revenue: number;
  runningPlan: string;
};

export type SellerSubscriptionsData = {
  id: string;
  imageUrl: string;
  sellersName: string;
  storeName: string;
  plane: string;
  purchaseDate: string;
  renewDate: string;
  status: "ACTIVE" | "PENDING" | "DEACTIVE" | "FAILED";
  details: SellerDetails;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// Consistent background color for the initials avatar, based on the name
const avatarColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-600",
  "bg-fuchsia-500",
  "bg-orange-500",
];

const getAvatarColor = (name?: string) => {
  const code = name ? name.charCodeAt(0) : 0;
  return avatarColors[code % avatarColors.length];
};

// Renders the real image when one exists, otherwise falls back to the
// first letter of the seller's name inside a colored circle.
const SellerAvatar = ({
  imageUrl,
  name,
}: {
  imageUrl?: string | null;
  name: string;
}) => {
  const hasImage = Boolean(imageUrl);
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";

  if (hasImage) {
    return (
      <Image
        src={imageUrl as string}
        alt={name}
        width={80}
        height={80}
        className="w-10 h-10 object-cover rounded-full border border-gray-200"
      />
    );
  }

  return (
    <div
      className={`w-10 h-10 flex items-center justify-center rounded-full text-white text-sm font-semibold border border-gray-200 ${getAvatarColor(
        name,
      )}`}
    >
      {initial}
    </div>
  );
};

const statusMap: Record<
  string,
  { color: "success" | "warning" | "default" | "error"; label: string }
> = {
  ACTIVE: { color: "success", label: "Active" },
  PENDING: { color: "warning", label: "Pending" },
  DEACTIVE: { color: "default", label: "Inactive" },
  FAILED: { color: "error", label: "Failed" },
};

const SellerSubscriptions = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<SellerSubscriptionsData | null>(
    null,
  );

  const queryArgs = useMemo(
    () => ({
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      startDate: dateRange
        ? dateRange[0].startOf("day").toISOString()
        : undefined,
      endDate: dateRange ? dateRange[1].endOf("day").toISOString() : undefined,
    }),
    [statusFilter, dateRange],
  );

  const { data, isFetching, isLoading, isError } =
    useGetAllSubscribedsellersritionQuery(queryArgs);

  const sellerSubscriptionsData: SellerSubscriptionsData[] = useMemo(() => {
    const rows = data?.result?.data || [];
    return rows.map((item: any) => ({
      id: item.id,
      imageUrl: item.sellerProfileImage || null,
      sellersName: item.sellerName,
      storeName: item.storeName,
      plane: item.planName || item.plan,
      purchaseDate: formatDate(item.purchaseDate),
      renewDate: formatDate(item.renewDate || item.endDate),
      status: item.status,
      details: {
        name: item.sellerName,
        email: item.sellerEmail,
        date: formatDate(item.purchaseDate),
        product: item.planName || item.plan,
        revenue: item.price,
        runningPlan: item.planName || item.plan,
      },
    }));
  }, [data]);

  const handleViewDetails = (row: SellerSubscriptionsData) => {
    setModalData(row);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalData(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Seller Subscriptions
          </h2>
          <p className="text-base text-gray-600 mt-1">
            Manage all seller subscription plans
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <RangePicker
            className="h-12 border border-gray-300 rounded-xl hover:border-gray-400 focus:border-blue-500"
            placeholder={["Start Date", "End Date"]}
            style={{ width: 280 }}
            value={dateRange}
            onChange={(range) => setDateRange(range as [Dayjs, Dayjs] | null)}
          />

          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
            style={{ width: 180, height: 48 }}
            className="rounded-xl"
            options={[
              { value: "ALL", label: "All Status" },
              { value: "ACTIVE", label: "Active" },
              { value: "PENDING", label: "Pending" },
              { value: "DEACTIVE", label: "Inactive" },
              { value: "FAILED", label: "Failed" },
            ]}
            dropdownStyle={{ borderRadius: "12px" }}
          />
        </div>
      </div>

      {/* Table (inlined — no separate <Table /> component) */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {isFetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <Spin size="large" />
          </div>
        )}

        {isError ? (
          <div className="py-16 text-center text-red-500 font-medium">
            Failed to load subscriptions. Please try again.
          </div>
        ) : (
          <div className="overflow-x-auto border-[1px] border-[#E6EFFF] rounded-[8px] bg-white">
            <table className="min-w-full divide-y divide-[#23232133]/20">
              <thead>
                <tr>
                  <th className="px-4 xl:px-6 py-6 text-left text-base font-normal font-inter text-[#232321CC]/80 tracking-wider w-16">
                    #
                  </th>
                  <th className="pl-4 pr-12 py-6 text-left text-base font-normal font-inter text-[#232321CC]/80 tracking-wider">
                    Seller Name
                  </th>
                  <th className="px-12 py-6 text-left text-base font-normal font-inter text-[#232321CC]/80 tracking-wider">
                    Plan
                  </th>
                  <th className="px-12 py-6 text-left text-base font-normal font-inter text-[#232321CC]/80 tracking-wider">
                    Purchase Date
                  </th>
                  <th className="px-12 py-6 text-left text-base font-normal font-inter text-[#232321CC]/80 tracking-wider">
                    Renew Date
                  </th>
                  <th className="px-4 py-6 text-left text-base font-normal font-inter text-[#232321CC]/80 tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-6 text-right text-base font-normal font-inter text-[#232321CC]/80 tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23232133]/20 text-black font-inter font-normal text-base">
                {isLoading && sellerSubscriptionsData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-1 xl:px-6 py-5 text-center">
                      <Skeleton active avatar paragraph={{ rows: 12 }} />
                    </td>
                  </tr>
                ) : sellerSubscriptionsData.length > 0 ? (
                  sellerSubscriptionsData.map((row, index) => {
                    const config = statusMap[row.status] || statusMap.FAILED;
                    return (
                      <tr key={row.id}>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                          {index + 1}
                        </td>
                        <td className="pl-4 pr-12 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <SellerAvatar
                              imageUrl={row.imageUrl}
                              name={row.sellersName}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">
                                {row.sellersName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {row.storeName}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-12 py-4 whitespace-nowrap">
                          {row.plane}
                        </td>
                        <td className="px-12 py-4 whitespace-nowrap">
                          {row.purchaseDate}
                        </td>
                        <td className="px-12 py-4 whitespace-nowrap">
                          {row.renewDate}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Tag
                            color={config.color}
                            className="px-5 py-1.5 text-xs font-semibold rounded-3xl flex items-center justify-center min-w-[92px] shadow-sm"
                          >
                            {config.label}
                          </Tag>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewDetails(row)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#00286B] px-6 py-2.5 text-white text-sm font-semibold hover:bg-[#001F4F] transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-1 xl:px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No subscriptions found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalData && (
        <SubscriptionsModal
          modalData={modalData}
          open={modalOpen}
          onCancel={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SellerSubscriptions;
