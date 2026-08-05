"use client";
import React, { useEffect, useState } from "react";
import { DatePicker } from "antd";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import Image from "next/image";
import { Search, SlidersHorizontal, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetAllSellerStoresQuery } from "@/redux/features/dashborad/sellerStoreApi";

const { RangePicker } = DatePicker;

export type SellerType = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  profileImage: string;
  storeId: string;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
};

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 500;

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

// ── Filter dropdown options ──────────────────────────────────────────────
// NOTE ON VALUES: `newest`, `oldest`, `nameAsc`, `nameDesc`, `all`, `hasStore`,
// `noStore` are confirmed straight from your Postman params. The sales/revenue
// sortBy values and the exact spelling of the 4th status ("Rejected") were cut
// off in the screenshot — I've filled in the reasonable guess, just double
// check these two against your backend/API docs and adjust if needed.
const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Name (A–Z)", value: "nameAsc" },
  { label: "Name (Z–A)", value: "nameDesc" },
  // { label: "Total sales (high to low)", value: "salesDesc" },
  // { label: "Total sales (low to high)", value: "salesAsc" },
  // { label: "Total revenue (high to low)", value: "revenueDesc" },
];

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All sellers", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Blocked", value: "Blocked" },
  { label: "Rejected", value: "Rejected" },
];

const STORE_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Has store", value: "hasStore" },
  { label: "No store", value: "noStore" },
];

// ── Skeleton loader (first-ever load, no cached data yet) ──────────────────
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

// ── Main component ──────────────────────────────────────────────────────────
const ProductListings = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // Raw text the user is typing vs. the debounced value actually sent to the API
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS[0]);
  const [selectedStoreFilter, setSelectedStoreFilter] = useState(
    STORE_FILTER_OPTIONS[0],
  );

  const [localCompanies] = useState<SellerType[]>([]);

  const router = useRouter();

  // Debounce the search box so we don't fire a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(1); // new search -> back to page 1
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 whenever a filter changes (search already handles itself above)
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSort, selectedStatus, selectedStoreFilter]);

  const { data, isLoading, isFetching } = useGetAllSellerStoresQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    sortBy: selectedSort.value || undefined,
    storeFilter: selectedStoreFilter.value || undefined,
    status: selectedStatus.value || undefined,
  });

  const fetchedSellers: SellerType[] = data?.result?.data ?? [];
  const totalItems: number =
    (data?.result?.meta?.total ?? 0) + localCompanies.length;
  const totalPages: number =
    data?.result?.meta?.totalPage ??
    Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  // Locally-created companies show up pinned to the top of page 1 only,
  // and only while no search/filter is active (they're not real API results).
  const noFilterActive =
    !debouncedSearch &&
    selectedStatus.value === "" &&
    selectedStoreFilter.value === "all";
  const sellersList: SellerType[] =
    currentPage === 1 && noFilterActive
      ? [...localCompanies, ...fetchedSellers]
      : fetchedSellers;

  // Full skeleton only on the very first load (no data yet at all).
  // Any subsequent fetch (typing a search, changing a filter/sort/page)
  // just dims the existing table + shows a small spinner, so the UI
  // doesn't jump around while the user is actively filtering.
  const showInitialSkeleton = isLoading && !data;
  const showRefetchOverlay = isFetching && !showInitialSkeleton;

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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search sellers..."
              className="h-[48px] w-[240px] rounded-[8px] border border-[#656562] pl-10 pr-9 text-sm text-black placeholder:text-gray-400 focus:outline-none"
            />
            {isFetching && searchInput && (
              <Loader2
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
              />
            )}
          </div>

          <div className="relative">
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
                          key={option.value}
                          type="button"
                          onClick={() => setSelectedSort(option)}
                          className={`text-left text-sm px-2 py-1.5 rounded-[6px] ${
                            selectedSort.value === option.value
                              ? "bg-black/10 text-black font-medium"
                              : "text-gray-600 hover:bg-black/5"
                          }`}
                        >
                          {option.label}
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
                          key={option.label}
                          type="button"
                          onClick={() => setSelectedStatus(option)}
                          className={`text-left text-sm px-2 py-1.5 rounded-[6px] ${
                            selectedStatus.value === option.value
                              ? "bg-black/10 text-black font-medium"
                              : "text-gray-600 hover:bg-black/5"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Store
                    </p>
                    <div className="flex flex-col gap-1">
                      {STORE_FILTER_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSelectedStoreFilter(option)}
                          className={`text-left text-sm px-2 py-1.5 rounded-[6px] ${
                            selectedStoreFilter.value === option.value
                              ? "bg-black/10 text-black font-medium"
                              : "text-gray-600 hover:bg-black/5"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="hidden gap-4">
          <RangePicker className="border-[#656562] border-[1px] h-[48px]" />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="mt-8">
        {showInitialSkeleton ? (
          <TableSkeleton />
        ) : (
          <div className="relative overflow-x-auto border-[1px] border-[#E6EFFF] rounded-[8px] bg-white">
            {/* Subtle dim + spinner while re-fetching (search/filter/page change),
               keeps the previous rows visible instead of flashing a skeleton */}
            {showRefetchOverlay && (
              <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-10">
                <Loader2 className="animate-spin text-gray-500" size={28} />
              </div>
            )}

            <table
              className={`min-w-full divide-y divide-[#23232133]/20 transition-opacity ${
                showRefetchOverlay ? "opacity-50" : "opacity-100"
              }`}
            >
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
                        <button
                          className="rounded-[8px] bg-black/20 cursor-pointer hover:bg-black/10 px-2 py-1 text-black font-inter text-base"
                          onClick={() =>
                            router.push(
                              `/dashboard/seller&store-oversight/product-listings/product-details?id=${row?.storeId}`,
                            )
                          }
                        >
                          View
                        </button>
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

        {!showInitialSkeleton && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={totalItems}
          />
        )}
      </div>
    </div>
  );
};

export default ProductListings;
