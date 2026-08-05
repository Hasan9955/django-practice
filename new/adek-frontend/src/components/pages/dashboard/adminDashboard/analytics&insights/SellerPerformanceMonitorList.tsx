// "use client";
// import Image from "next/image";
// import { Skeleton } from "antd";
// import { useRouter } from "next/navigation";
// import { Table } from "@/components/ui/Table/Table";
// import { Pagination } from "@/components/ui/Pagination/Pagination";
// import { useState } from "react";
// import { useGetAllSellerStoresQuery } from "@/redux/features/dashborad/sellerStoreApi";
// import { SellerType } from "../seller&store-oversight/ProductListings";

// const ITEMS_PER_PAGE = 8;

// const SellerPerformanceMonitorList = () => {
//   const [currentPage, setCurrentPage] = useState(1);

//   const { data, isLoading } = useGetAllSellerStoresQuery({
//     page: currentPage,
//     limit: ITEMS_PER_PAGE,
//   });

//   const sellersList = data?.result?.data || [];
//   const meta = data?.result?.meta || {};

//   const totalItems = meta.total || 0;
//   const totalPages = meta.totalPage || 1;

//   const router = useRouter();

//   const columns = [
//     {
//       header: "Sellers Name",
//       accessor: "sellersName",
//       className: "pl-4 pr-12",

//       render: (row: SellerType) => {
//         const sellerImageUrl = row.profileImage || "/placeholder-avatar.png"; // ✅ fallback for empty image
//         const sellerName = row.fullName;

//         return (
//           <div className="flex items-center">
//             <Image
//               src={sellerImageUrl}
//               alt={sellerName}
//               width={100}
//               height={100}
//               className="w-10 h-10 object-cover object-center rounded-full mr-4"
//             />
//             <span>{sellerName}</span>
//           </div>
//         );
//       },
//     },
//     {
//       header: "Company Name",
//       accessor: "companyName",
//       className: "px-12",
//     },
//     {
//       header: "Phone Number",
//       accessor: "phoneNumber",
//       className: "px-12",
//     },
//     {
//       header: "Total Products",
//       accessor: "totalProducts",
//       className: "px-2",
//     },
//     {
//       header: "Total Sales",
//       accessor: "totalSales",
//       className: "px-2",
//     },
//     {
//       header: "Total Revenue",
//       accessor: "totalRevenue",
//       className: "px-2",
//     },
//     {
//       header: "Details",
//       accessor: "details",
//       className: "px-2",
//       render: (row: SellerType) => (
//         <div className="flex items-center space-x-2">
//           <button
//             className="rounded-[8px] bg-black/20 cursor-pointer hover:bg-black/10 inline-block px-2 py-1 text-black font-inter text-base"
//             onClick={() => handleViewDetails(row)}
//           >
//             View
//           </button>
//         </div>
//       ),
//     },
//   ];

//   const handleViewDetails = (row: SellerType) => {
//     router.push(
//       `/dashboard/analytics&insights/seller-performance-monitor/${row.id}`,
//     );
//   };

//   return (
//     <div>
//       <div>
//         <div className="flex justify-between items-start">
//           <div>
//             <h2 className="text-black font-sans text-2xl font-bold leading-normal">
//               All Sellers list
//             </h2>
//             <p className="text-black font-sans text-base font-semibold leading-normal">
//               All new seller request
//             </p>
//           </div>
//         </div>

//         <div className="mt-8">
//           {isLoading ? (
//             <Skeleton active />
//           ) : (
//             <Table columns={columns} data={sellersList} />
//           )}
//         </div>
//       </div>

//       {!isLoading && totalPages > 1 && (
//         <div className="mt-6 flex justify-end">
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={setCurrentPage}
//             itemsPerPage={ITEMS_PER_PAGE}
//             totalItems={totalItems}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default SellerPerformanceMonitorList;

"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useGetAllSellerStoresQuery } from "@/redux/features/dashborad/sellerStoreApi";
import { SellerType } from "../seller&store-oversight/ProductListings";

const ITEMS_PER_PAGE = 20;

// A small fixed palette so initials avatars look varied but consistent per-name
const AVATAR_COLORS = [
  "#F87171", // red
  "#FB923C", // orange
  "#FBBF24", // amber
  "#4ADE80", // green
  "#2DD4BF", // teal
  "#38BDF8", // sky
  "#818CF8", // indigo
  "#C084FC", // purple
  "#F472B6", // pink
];

// Deterministically pick a color based on the name so the same user
// always gets the same avatar color.
const getAvatarColor = (name: string) => {
  const str = name?.trim() || "?";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// Get the initial to show when there is no profile image.
const getInitials = (name: string) => {
  const trimmed = name?.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
};

// ── Avatar ────────────────────────────────────────────────────────────────
const SellerAvatar = ({
  name,
  profileImage,
}: {
  name: string;
  profileImage?: string;
}) => {
  if (profileImage) {
    return (
      <Image
        src={profileImage}
        alt={name}
        width={40}
        height={40}
        className="w-10 h-10 rounded-full mr-4 object-cover object-center bg-gray-100"
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+"
        loading="lazy"
        sizes="40px"
        quality={75}
      />
    );
  }

  return (
    <div
      className="w-10 h-10 rounded-full mr-4 flex items-center justify-center text-white font-semibold text-sm shrink-0"
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
};

// ── Filter dropdown options (UI only — not wired to real filtering yet) ────
const SORT_OPTIONS = [
  "Newest first",
  "Oldest first",
  "Name (A–Z)",
  "Name (Z–A)",
  "Total sales (high to low)",
  "Total sales (low to high)",
  "Total revenue (high to low)",
];

const STATUS_OPTIONS = [
  "All sellers",
  "Active",
  "Inactive",
  "Pending approval",
];

// ── Skeleton loader ──────────────────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="w-full animate-pulse">
    <div className="flex gap-6 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      {["w-10", "w-40", "w-32", "w-28", "w-24", "w-24", "w-28", "w-16"].map(
        (w, i) => (
          <div key={i} className={`h-4 bg-gray-300 rounded ${w}`} />
        ),
      )}
    </div>

    {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
      <div
        key={idx}
        className="flex items-center gap-6 px-4 py-4 border-b border-gray-100"
      >
        <div className="h-4 bg-gray-200 rounded w-6" />
        <div className="flex items-center gap-3 w-40 shrink-0">
          <div className="w-10 h-10 bg-gray-300 rounded-full shrink-0" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
        {["w-32", "w-28", "w-16", "w-16", "w-20", "w-14"].map((w, i) => (
          <div key={i} className={`h-4 bg-gray-200 rounded ${w}`} />
        ))}
      </div>
    ))}
  </div>
);

// ── Main component (table markup lives directly inside — no separate
// generic <Table /> import) ─────────────────────────────────────────────────
const SellerPerformanceMonitorList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS[0]);

  // Companies created locally through the modal. There's no create endpoint
  // yet, so these live in local state and show up pinned to page 1. Swap
  // this out for a real mutation once the API exists.
  const [localCompanies] = useState<SellerType[]>([]);

  const router = useRouter();

  const { data, isLoading } = useGetAllSellerStoresQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const fetchedSellers: SellerType[] = data?.result?.data ?? [];
  const totalItems: number =
    (data?.result?.meta?.total ?? 0) + localCompanies.length;
  const totalPages: number =
    data?.result?.meta?.totalPage ??
    Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  // Locally-created companies show up pinned to the top of page 1 only.
  const sellersList: SellerType[] =
    currentPage === 1 ? [...localCompanies, ...fetchedSellers] : fetchedSellers;

  const handleViewDetails = (row: SellerType) => {
    router.push(
      `/dashboard/analytics&insights/seller-performance-monitor/Performance-Monitor-Details?id=${row.id}`,
    );
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-black font-sans text-2xl font-bold leading-normal">
            All Sellers list
          </h2>
          <p className="text-black font-sans text-base font-semibold leading-normal">
            All new seller request
          </p>
        </div>

        {/* ── Search + Filter + Create Company ── */}
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sellers..."
              className="h-[48px] w-[240px] rounded-[8px] border border-[#656562] pl-10 pr-4 text-sm text-black placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilter((prev) => !prev)}
            className="flex items-center gap-2 h-[48px] px-4 rounded-[8px] border border-[#656562] text-sm font-medium text-black hover:bg-black/5"
          >
            <SlidersHorizontal size={18} />
            Filter
            <ChevronDown
              size={16}
              className={`transition-transform ${
                showFilter ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* ── Filter dropdown panel ── */}
          {showFilter && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowFilter(false)}
              />
              <div className="absolute right-0 top-[56px] z-20 w-[260px] rounded-[8px] border border-[#E6EFFF] bg-white shadow-lg p-4">
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Sort by
                  </p>
                  <div className="flex flex-col gap-1">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedSort(option)}
                        className={`text-left text-sm px-2 py-1.5 rounded-[6px] ${
                          selectedSort === option
                            ? "bg-black/10 text-black font-medium"
                            : "text-gray-600 hover:bg-black/5"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Status
                  </p>
                  <div className="flex flex-col gap-1">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedStatus(option)}
                        className={`text-left text-sm px-2 py-1.5 rounded-[6px] ${
                          selectedStatus === option
                            ? "bg-black/10 text-black font-medium"
                            : "text-gray-600 hover:bg-black/5"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2 border-t border-[#E6EFFF]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSort(SORT_OPTIONS[0]);
                      setSelectedStatus(STATUS_OPTIONS[0]);
                    }}
                    className="text-sm text-gray-500 hover:text-black"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilter(false)}
                    className="text-sm font-medium rounded-[6px] bg-black text-white px-3 py-1.5 hover:bg-black/80"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="mt-8">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto border-[1px] border-[#E6EFFF] rounded-[8px] bg-white">
            <table className="min-w-full divide-y divide-[#23232133]/20">
              <thead>
                <tr>
                  {[
                    "SL",
                    "Sellers Name",
                    "Company Name",
                    "Phone Number",
                    "Total Products",
                    "Total Sales",
                    "Total Revenue",
                    "Details",
                  ].map((header, i) => (
                    <th
                      key={header}
                      className={`px-1 xl:px-6 py-6 text-left text-base font-normal font-inter text-[#232321CC]/80 tracking-wider ${
                        i === 0 ? "pl-4" : ""
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23232133]/20 text-black font-inter font-normal text-base">
                {sellersList.length > 0 ? (
                  sellersList?.map((row, index) => (
                    <tr key={row.id}>
                      <td className="px-1 xl:px-6 py-4 whitespace-nowrap pl-4">
                        <span className="text-gray-500">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </span>
                      </td>
                      <td className="px-1 xl:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <SellerAvatar
                            name={row.fullName}
                            profileImage={row.profileImage}
                          />
                          <span>{row.fullName}</span>
                        </div>
                      </td>
                      <td className="px-1 xl:px-6 py-4 whitespace-nowrap">
                        <span
                          className={
                            row.companyName ? "" : "text-gray-400 italic"
                          }
                        >
                          {row.companyName || "N/A"}
                        </span>
                      </td>
                      <td className="px-1 xl:px-6 py-4 whitespace-nowrap">
                        {row.phoneNumber}
                      </td>
                      <td className="px-1 xl:px-6 py-4 whitespace-nowrap">
                        {row.totalProducts}
                      </td>
                      <td className="px-1 xl:px-6 py-4 whitespace-nowrap">
                        {row.totalSales}
                      </td>
                      <td className="px-1 xl:px-6 py-4 whitespace-nowrap">
                        {row.totalRevenue}
                      </td>
                      <td className="px-1 xl:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            className="rounded-[8px] bg-black/20 cursor-pointer hover:bg-black/10 inline-block px-2 py-1 text-black font-inter text-base"
                            onClick={() => handleViewDetails(row)}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-1 xl:px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No sellers found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="mt-6 flex justify-end">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={totalItems}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerPerformanceMonitorList;
