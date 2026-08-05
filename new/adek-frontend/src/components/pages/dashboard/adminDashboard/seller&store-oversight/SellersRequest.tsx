// // export default SellersRequest;
// "use client";
// import { Button } from "@/components/ui/Button/Button";
// import dayjs from "dayjs";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/DropDownMenu/DropDownMenu";
// import { ChevronDown, Loader2, Search } from "lucide-react";
// import { useEffect, useState } from "react";
// import { Dropdown, MenuProps, Skeleton } from "antd";
// import { Table } from "@/components/ui/Table/Table";
// import Image from "next/image";
// import { Pagination } from "@/components/ui/Pagination/Pagination";
// import {
//   useChangeStoreStatusMutation,
//   useGetStoreAllQuery,
// } from "@/redux/features/dashborad/sellerStoreApi";
// import SellerDetailsModal from "@/components/ui/Modal/Dashbord/SellerDetailsModal";
// import { FaCaretDown } from "react-icons/fa";
// import toast from "react-hot-toast";

// const ITEMS_PER_PAGE = 20;
// const SEARCH_DEBOUNCE_MS = 400;

// export type SellerStatus = "Approved" | "Pending" | "Rejected" | "Blocked";
// export type StatusFilter = "All" | SellerStatus;

// export type SellersRequestData = {
//   id: string;
//   bannerImage: string;
//   name: string;
//   shopName: string;
//   desc: string;
//   phoneNumber?: string;
//   email?: string;
//   shopLogo?: string;
//   status: SellerStatus;
//   sellerId?: string;
//   createdAt?: string;
//   updatedAt: string;
//   seller?: {
//     id: string;
//     fullName: string;
//     email: string;
//     phoneNumber: string;
//     companyName?: string;
//     location?: string;
//   };
//   sellersName?: string;
//   location?: string;
//   date?: string;
//   imageUrl?: string;
//   slug?: string;
//   followers?: number;
//   followings?: number;
//   totalWithdraw?: number;
//   address?: string;
//   city?: string;
//   country?: string;
//   zipcode?: string;
// };

// // Row shape after we stamp a display number onto each paginated item
// type NumberedSellerRow = SellersRequestData & { rowNumber: number };

// /**
//  * Small debounce hook — delays updating `debouncedValue` until the user
//  * has stopped typing for `delay` ms. Keeps us from firing a network
//  * request on every keystroke.
//  */
// function useDebouncedValue<T>(value: T, delay: number): T {
//   const [debounced, setDebounced] = useState(value);

//   useEffect(() => {
//     const timer = setTimeout(() => setDebounced(value), delay);
//     return () => clearTimeout(timer);
//   }, [value, delay]);

//   return debounced;
// }

// const SellersRequest = () => {
//   const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");
//   const [searchInput, setSearchInput] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedSeller, setSelectedSeller] =
//     useState<SellersRequestData | null>(null);

//   const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

//   const [updateSellerStatus] = useChangeStoreStatusMutation();

//   // The API does the filtering — we just pass through whatever is active.
//   const { data, error, isLoading, isFetching } = useGetStoreAllQuery({
//     search: debouncedSearch.trim() || undefined,
//     status: selectedStatus !== "All" ? selectedStatus : undefined,
//   });

//   const storeData: SellersRequestData[] = data?.result?.data ?? [];

//   // Whenever the active search term or status filter changes, snap back to
//   // page 1 — otherwise you can end up "stuck" on a page that no longer exists.
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [debouncedSearch, selectedStatus]);

//   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//   const endIndex = startIndex + ITEMS_PER_PAGE;
//   const paginatedData = storeData.slice(startIndex, endIndex);
//   const totalPages = Math.ceil(storeData.length / ITEMS_PER_PAGE);

//   // Stamp a display-only row number onto each item on the current page
//   const numberedData: NumberedSellerRow[] = paginatedData.map((item, idx) => ({
//     ...item,
//     rowNumber: startIndex + idx + 1,
//   }));

//   const periods: StatusFilter[] = [
//     "All",
//     "Approved",
//     "Pending",
//     "Rejected",
//     "Blocked",
//   ];

//   const statusClasses: Record<string, string> = {
//     Approved:
//       "rounded-full bg-[#EBFAEB] flex w-[72px] px-0 py-1 justify-center items-center gap-2.5 text-[#249224] font-dm text-xs",
//     Pending:
//       "rounded-full bg-[#FFF3CD] flex w-[72px] px-0 py-1 justify-center items-center gap-2.5 text-[#856404] font-dm text-xs",
//     Rejected:
//       "rounded-full bg-[#FEE6E6] flex w-[72px] px-0 py-1 justify-center items-center gap-2.5 text-[#DA0000] font-dm text-xs",
//     Blocked:
//       "rounded-full bg-[#F5C6CB] flex w-[72px] px-0 py-1 justify-center items-center gap-2.5 text-[#721C24] font-dm text-xs",
//   };

//   const items: MenuProps["items"] = [
//     { key: "Approved", label: "Approved" },
//     { key: "Pending", label: "Pending" },
//     { key: "Rejected", label: "Rejected" },
//     { key: "Blocked", label: "Blocked" },
//   ];

//   const handleMenuClick = (rowId: string) => async (info: { key: string }) => {
//     try {
//       const res = await updateSellerStatus({ id: rowId, status: info.key });
//       if ("data" in res) {
//         toast.success("Status updated successfully");
//       } else {
//         toast.error("Failed to update status");
//       }
//     } catch {
//       toast.error("Failed to update status");
//     }
//   };

//   const columns = [
//     {
//       header: "No.",
//       accessor: "rowNumber",
//       className: "pl-4 pr-4 w-12",
//       render: (row: NumberedSellerRow) => (
//         <span className="text-black font-dm text-xs">{row.rowNumber}</span>
//       ),
//     },
//     {
//       header: "Sellers Name",
//       accessor: "sellersName",
//       className: "pl-4 pr-12",
//       render: (row: NumberedSellerRow) => {
//         const sellerImageUrl = row.imageUrl || row.bannerImage || "";
//         const sellerName = row.sellersName || row.name || "";

//         return (
//           <div className="flex items-center">
//             <Image
//               src={sellerImageUrl}
//               alt={sellerName}
//               width={80}
//               height={80}
//               className="w-8 h-8 rounded-full mr-4"
//             />
//             <span>{sellerName}</span>
//           </div>
//         );
//       },
//     },
//     {
//       header: "Email",
//       accessor: "email",
//       className: "px-12",
//     },
//     {
//       header: "Date",
//       accessor: "updatedAt",
//       className: "px-12",
//       render: (row: NumberedSellerRow) => (
//         <span>{dayjs(row.updatedAt).format("YYYY-MM-DD")}</span>
//       ),
//     },
//     {
//       header: "Status",
//       accessor: "status",
//       className: "px-2",
//       render: (row: NumberedSellerRow) => (
//         <div className="flex items-center gap-2">
//           <span
//             className={
//               statusClasses[row.status] ||
//               "rounded-full bg-gray-200 text-gray-700 px-2 py-1 text-xs"
//             }
//           >
//             {row.status}
//           </span>

//           <Dropdown
//             menu={{
//               items,
//               onClick: handleMenuClick(row.id),
//             }}
//             trigger={["click"]}
//           >
//             <a onClick={(e) => e.preventDefault()}>
//               <FaCaretDown />
//             </a>
//           </Dropdown>
//         </div>
//       ),
//     },
//     {
//       header: "Details",
//       accessor: "details",
//       className: "px-2",
//       render: (row: NumberedSellerRow) => (
//         <div className="flex items-center space-x-2">
//           <button
//             className="rounded-[8px] bg-black/20 cursor-pointer hover:bg-[#eff3ff] flex px-2 py-1 justify-center items-center gap-2.5 text-[#00286B] font-dm text-xs leading-[14.4px] tracking-[-0.18px]"
//             onClick={() => handleViewDetails(row)}
//           >
//             View
//           </button>
//         </div>
//       ),
//     },
//   ];

//   const handleViewDetails = (row: SellersRequestData) => {
//     setSelectedSeller(row);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedSeller(null);
//   };

//   const handleStatusChange = (period: StatusFilter) => {
//     setSelectedStatus(period);
//   };

//   if (error) {
//     return <div>Error loading data</div>;
//   }

//   return (
//     <div>
//       {isLoading ? (
//         <Skeleton active />
//       ) : (
//         <div>
//           <div className="flex justify-between items-start">
//             <div>
//               <h2 className="text-black font-sans text-2xl font-bold leading-normal">
//                 Seller Approval Requests
//               </h2>
//               <p className="text-black/70 font-sans text-sm max-w-lg leading-normal">
//                 Manage all new seller requests from this page. Review
//                 application details, search by seller or store, and approve or
//                 reject requests.
//               </p>
//             </div>

//             <div className="flex gap-4 mb-4">
//               {/* Live search — debounced, hits the API via `search` param */}
//               <div className="flex items-center border border-[#656562] bg-white rounded-md px-3 gap-2 h-10 w-[220px]">
//                 {isFetching ? (
//                   <Loader2 className="h-4 w-4 text-[#656562] animate-spin" />
//                 ) : (
//                   <Search className="h-4 w-4 text-[#656562]" />
//                 )}
//                 <input
//                   type="text"
//                   value={searchInput}
//                   onChange={(e) => setSearchInput(e.target.value)}
//                   placeholder="Search"
//                   className="w-full outline-none border-none bg-transparent text-sm placeholder:text-[#656562]"
//                 />
//               </div>

//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   {/*
//                     Focus-ring fix: kill the native outline AND any
//                     Tailwind/shadcn focus ring (box-shadow based), plus its
//                     offset layer. Border width/color never change on
//                     focus/active, so the button never shifts or resizes.
//                   */}
//                   <Button
//                     variant="outline"
//                     className="flex items-center border-[#656562] bg-white border rounded-md gap-2
//                       outline-none focus:outline-none focus-visible:outline-none
//                       ring-0 focus:ring-0 focus-visible:ring-0
//                       ring-offset-0 focus:ring-offset-0
//                       active:outline-none active:ring-0
//                       select-none"
//                   >
//                     {selectedStatus}
//                     <ChevronDown className="h-4 w-4" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   {periods.map((period) => (
//                     <DropdownMenuItem
//                       key={period}
//                       onClick={() => handleStatusChange(period)}
//                       className={
//                         selectedStatus === period
//                           ? "bg-gray-100 text-blue-700 font-semibold"
//                           : ""
//                       }
//                     >
//                       {period}
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>

//           {/* Dim the table slightly while a new page/search/filter is loading,
//               instead of yanking it out and showing a full skeleton again. */}
//           <div
//             className={`mt-8 transition-opacity ${
//               isFetching ? "opacity-60" : "opacity-100"
//             }`}
//           >
//             <Table
//               columns={columns}
//               data={numberedData}
//               emptyMessage="No sellers found matching your criteria"
//             />
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={setCurrentPage}
//               itemsPerPage={ITEMS_PER_PAGE}
//               totalItems={storeData.length}
//             />
//           </div>

//           <SellerDetailsModal
//             isOpen={isModalOpen}
//             onClose={handleCloseModal}
//             sellerData={selectedSeller}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default SellersRequest;
// export default SellersRequest;
"use client";
import { Button } from "@/components/ui/Button/Button";
import dayjs from "dayjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropDownMenu/DropDownMenu";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Dropdown, MenuProps, Skeleton } from "antd";
import { Table } from "@/components/ui/Table/Table";
import Image from "next/image";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import {
  useChangeStoreStatusMutation,
  useGetStoreAllQuery,
} from "@/redux/features/dashborad/sellerStoreApi";
import SellerDetailsModal from "@/components/ui/Modal/Dashbord/SellerDetailsModal";
import { FaCaretDown } from "react-icons/fa";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 400;

export type SellerStatus = "Approved" | "Pending" | "Rejected" | "Blocked";
export type StatusFilter = "All" | SellerStatus;

export type SellersRequestData = {
  id: string;
  bannerImage: string;
  name: string;
  shopName: string;
  desc: string;
  phoneNumber?: string;
  email?: string;
  shopLogo?: string;
  status: SellerStatus;
  sellerId?: string;
  createdAt?: string;
  updatedAt: string;
  seller?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    companyName?: string;
    location?: string;
  };
  sellersName?: string;
  location?: string;
  date?: string;
  imageUrl?: string;
  slug?: string;
  followers?: number;
  followings?: number;
  totalWithdraw?: number;
  address?: string;
  city?: string;
  country?: string;
  zipcode?: string;
};

// Row shape after we stamp a display number onto each paginated item
type NumberedSellerRow = SellersRequestData & { rowNumber: number };

/**
 * Small debounce hook — delays updating `debouncedValue` until the user
 * has stopped typing for `delay` ms. Keeps us from firing a network
 * request on every keystroke.
 */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

const SellersRequest = () => {
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] =
    useState<SellersRequestData | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  const [updateSellerStatus] = useChangeStoreStatusMutation();

  // The API now does BOTH the filtering AND the pagination — we only
  // ever hold one page's worth of rows in memory. This is what fixes
  // the "total is wrong" bug: previously we fetched one batch (capped
  // by whatever default limit the backend used) and then sliced it
  // client-side, so `totalPages` was computed from that partial batch
  // instead of the real total row count in the database.
  const { data, error, isLoading, isFetching } = useGetStoreAllQuery({
    search: debouncedSearch.trim() || undefined,
    status: selectedStatus !== "All" ? selectedStatus : undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const storeData: SellersRequestData[] = data?.result?.data ?? [];

  // Adjust this line to match whatever field your backend actually
  // returns the total count under. Common shapes:
  //   data.result.total
  //   data.result.meta.total
  //   data.result.totalCount
  // Falls back to storeData.length only if none of those exist, so it
  // still "works" (just without a real total) if the API contract
  // changes.
  const totalItems: number =
    data?.result?.total ??
    data?.result?.meta?.total ??
    data?.result?.totalCount ??
    storeData.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  // Whenever the active search term or status filter changes, snap back to
  // page 1 — otherwise you can end up requesting a page that no longer
  // exists for the new filter/search combo.
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedStatus]);

  // Row numbers are based on the current page + limit, since the server
  // now only ever sends us this page's slice, not the whole dataset.
  const numberedData: NumberedSellerRow[] = storeData.map((item, idx) => ({
    ...item,
    rowNumber: (currentPage - 1) * ITEMS_PER_PAGE + idx + 1,
  }));

  const periods: StatusFilter[] = [
    "All",
    "Approved",
    "Pending",
    "Rejected",
    "Blocked",
  ];

  const statusClasses: Record<string, string> = {
    Approved:
      "rounded-full bg-[#EBFAEB] flex w-[72px] px-0 py-1 justify-center items-center gap-2.5 text-[#249224] font-dm text-xs",
    Pending:
      "rounded-full bg-[#FFF3CD] flex w-[72px] px-0 py-1 justify-center items-center gap-2.5 text-[#856404] font-dm text-xs",
    Rejected:
      "rounded-full bg-[#FEE6E6] flex w-[72px] px-0 py-1 justify-center items-center gap-2.5 text-[#DA0000] font-dm text-xs",
    Blocked:
      "rounded-full bg-[#F5C6CB] flex w-[72px] px-0 py-1 justify-center items-center gap-2.5 text-[#721C24] font-dm text-xs",
  };

  const items: MenuProps["items"] = [
    { key: "Approved", label: "Approved" },
    { key: "Pending", label: "Pending" },
    { key: "Rejected", label: "Rejected" },
    { key: "Blocked", label: "Blocked" },
  ];

  const handleMenuClick = (rowId: string) => async (info: { key: string }) => {
    try {
      const res = await updateSellerStatus({ id: rowId, status: info.key });
      if ("data" in res) {
        toast.success("Status updated successfully");
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const columns = [
    {
      header: "No.",
      accessor: "rowNumber",
      className: "pl-4 pr-4 w-12",
      render: (row: NumberedSellerRow) => (
        <span className="text-black font-dm text-xs">{row.rowNumber}</span>
      ),
    },
    {
      header: "Sellers Name",
      accessor: "sellersName",
      className: "pl-4 pr-12",
      render: (row: NumberedSellerRow) => {
        const sellerImageUrl = row.imageUrl || row.bannerImage || "";
        const sellerName = row.sellersName || row.name || "";

        return (
          <div className="flex items-center">
            <Image
              src={sellerImageUrl}
              alt={sellerName}
              width={80}
              height={80}
              className="w-8 h-8 rounded-full mr-4"
            />
            <span>{sellerName}</span>
          </div>
        );
      },
    },
    {
      header: "Email",
      accessor: "email",
      className: "px-12",
    },
    {
      header: "Date",
      accessor: "updatedAt",
      className: "px-12",
      render: (row: NumberedSellerRow) => (
        <span>{dayjs(row.updatedAt).format("YYYY-MM-DD")}</span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      className: "px-2",
      render: (row: NumberedSellerRow) => (
        <div className="flex items-center gap-2">
          <span
            className={
              statusClasses[row.status] ||
              "rounded-full bg-gray-200 text-gray-700 px-2 py-1 text-xs"
            }
          >
            {row.status}
          </span>

          <Dropdown
            menu={{
              items,
              onClick: handleMenuClick(row.id),
            }}
            trigger={["click"]}
          >
            <a onClick={(e) => e.preventDefault()}>
              <FaCaretDown />
            </a>
          </Dropdown>
        </div>
      ),
    },
    {
      header: "Details",
      accessor: "details",
      className: "px-2",
      render: (row: NumberedSellerRow) => (
        <div className="flex items-center space-x-2">
          <button
            className="rounded-[8px] bg-black/20 cursor-pointer hover:bg-[#eff3ff] flex px-2 py-1 justify-center items-center gap-2.5 text-[#00286B] font-dm text-xs leading-[14.4px] tracking-[-0.18px]"
            onClick={() => handleViewDetails(row)}
          >
            View
          </button>
        </div>
      ),
    },
  ];

  const handleViewDetails = (row: SellersRequestData) => {
    setSelectedSeller(row);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSeller(null);
  };

  const handleStatusChange = (period: StatusFilter) => {
    setSelectedStatus(period);
  };

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <div>
      {isLoading ? (
        <Skeleton active />
      ) : (
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-black font-sans text-2xl font-bold leading-normal">
                Seller Approval Requests
              </h2>
              <p className="text-black/70 font-sans text-sm max-w-lg leading-normal">
                Manage all new seller requests from this page. Review
                application details, search by seller or store, and approve or
                reject requests.
              </p>
            </div>

            <div className="flex gap-4 mb-4">
              {/* Live search — debounced, hits the API via `search` param */}
              <div className="flex items-center border border-[#656562] bg-white rounded-md px-3 gap-2 h-10 w-[220px]">
                {isFetching ? (
                  <Loader2 className="h-4 w-4 text-[#656562] animate-spin" />
                ) : (
                  <Search className="h-4 w-4 text-[#656562]" />
                )}
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search"
                  className="w-full outline-none border-none bg-transparent text-sm placeholder:text-[#656562]"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/*
                    Focus-ring fix: kill the native outline AND any
                    Tailwind/shadcn focus ring (box-shadow based), plus its
                    offset layer. Border width/color never change on
                    focus/active, so the button never shifts or resizes.
                  */}
                  <Button
                    variant="outline"
                    className="flex items-center border-[#656562] bg-white border rounded-md gap-2
                      outline-none focus:outline-none focus-visible:outline-none
                      ring-0 focus:ring-0 focus-visible:ring-0
                      ring-offset-0 focus:ring-offset-0
                      active:outline-none active:ring-0
                      select-none"
                  >
                    {selectedStatus}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {periods.map((period) => (
                    <DropdownMenuItem
                      key={period}
                      onClick={() => handleStatusChange(period)}
                      className={
                        selectedStatus === period
                          ? "bg-gray-100 text-blue-700 font-semibold"
                          : ""
                      }
                    >
                      {period}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Dim the table slightly while a new page/search/filter is loading,
              instead of yanking it out and showing a full skeleton again. */}
          <div
            className={`mt-8 transition-opacity ${
              isFetching ? "opacity-60" : "opacity-100"
            }`}
          >
            <Table
              columns={columns}
              data={numberedData}
              emptyMessage="No sellers found matching your criteria"
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={totalItems}
            />
          </div>

          <SellerDetailsModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            sellerData={selectedSeller}
          />
        </div>
      )}
    </div>
  );
};

export default SellersRequest;
