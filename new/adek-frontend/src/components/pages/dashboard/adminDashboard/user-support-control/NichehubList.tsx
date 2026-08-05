// "use client";
// import { Table } from "@/components/ui/Table/Table";
// import { useGetNicheHubQuery } from "@/redux/features/niche_hub/nicheHubApi";
// import { DatePicker, Pagination } from "antd";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// const { RangePicker } = DatePicker;

// export interface PollOption {
//   id: string;
//   pollId: string;
//   text: string;
//   voteCount: number;
// }

// export interface Poll {
//   id: string;
//   nicheHubId: string;
//   question: string;
//   createdAt: string;
//   updatedAt: string;
//   options: PollOption[];
// }

// export interface UserStore {
//   id: string;
//   name: string;
//   shopName: string;
//   bannerImage: string;
//   shopLogo: string;
//   Follow: Array<{ followerId: string }>;
// }

// export interface User {
//   id: string;
//   fullName: string;
//   profileImage: string;
//   store?: UserStore[];
// }

// export interface NicheHubPost {
//   id: string;
//   title: string;
//   fileUrl: string[];
//   createdAt: string;
//   likeCount: number;
//   commentCount: number;
//   visibility: "ALL" | "PRIVATE" | "FRIENDS";
//   userId: string;
//   Like: string[];
//   user: User;
//   Poll: Poll[];
// }

// const NichehubList = () => {
//   const router = useRouter();

//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(25);

//   const { data, isLoading } = useGetNicheHubQuery({
//     page,
//     limit,
//   });

//   const nicheHubListData = data?.result?.data || [];
//   const meta = data?.result?.meta;

//   const handleViewDetails = (row: NicheHubPost) => {
//     router.push(
//       `/dashboard/user-support-control/community-feedback/Nichehub-Details?id=${row.id}`,
//     );
//   };

//   const columns = [
//     {
//       header: "Sellers Name",
//       accessor: "sellersName",
//       className: "pl-4 pr-12",
//       render: (row: NicheHubPost) => {
//         const sellerImageUrl = row?.user?.profileImage || "";
//         const sellerName = row?.user?.fullName || "Unknown Seller";
//         return (
//           <div className="flex items-center">
//             <Image
//               src={sellerImageUrl}
//               alt={sellerName}
//               width={40}
//               height={40}
//               className="w-10 h-10 object-cover object-center rounded-full mr-4"
//             />
//             <span className="font-medium text-black">{sellerName}</span>
//           </div>
//         );
//       },
//     },
//     {
//       header: "Shop Name",
//       accessor: "shopName",
//       className: "px-12",
//       render: (row: NicheHubPost) => {
//         const shopName = row?.user?.store?.[0]?.shopName || "N/A";
//         return <span className="text-black font-medium">{shopName}</span>;
//       },
//     },
//     {
//       header: "Post Title",
//       accessor: "title",
//       className: "px-12 max-w-[280px]",
//       render: (row: NicheHubPost) => (
//         <div className="line-clamp-2 text-sm text-black" title={row.title}>
//           {row.title || "No title provided"}
//         </div>
//       ),
//     },
//     {
//       header: "Created At",
//       accessor: "createdAt",
//       className: "px-12",
//       render: (row: NicheHubPost) =>
//         new Date(row.createdAt).toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//         }),
//     },
//     {
//       header: "Likes",
//       accessor: "likeCount",
//       className: "px-12 text-center",
//       render: (row: NicheHubPost) => (
//         <span className="font-medium text-black">{row.likeCount}</span>
//       ),
//     },
//     {
//       header: "Comments",
//       accessor: "commentCount",
//       className: "px-12 text-center",
//       render: (row: NicheHubPost) => (
//         <span className="font-medium text-black">{row.commentCount}</span>
//       ),
//     },
//     {
//       header: "Visibility",
//       accessor: "visibility",
//       className: "px-12",
//       render: (row: NicheHubPost) => (
//         <span className="inline-flex items-center rounded-full bg-black/10 px-3 py-1 text-xs font-medium capitalize text-black">
//           {row.visibility.toLowerCase()}
//         </span>
//       ),
//     },
//     {
//       header: "Details",
//       accessor: "details",
//       className: "px-2",
//       render: (row: NicheHubPost) => (
//         <button
//           className="rounded-[8px] bg-black/20 hover:bg-black/10 px-4 py-1.5 text-black font-medium text-sm transition-colors"
//           onClick={() => handleViewDetails(row)}
//         >
//           View
//         </button>
//       ),
//     },
//   ];

//   const handlePaginationChange = (newPage: number, newPageSize: number) => {
//     setPage(newPage);
//     if (newPageSize !== limit) {
//       setLimit(newPageSize);
//       setPage(1);
//     }
//   };

//   return (
//     <div className="inline-flex w-full flex-col items-start gap-[68px] p-[28px] pb-[48px] rounded-[16px] bg-white">
//       <div className="flex items-start justify-between w-full">
//         <div>
//           <h4 className="text-black font-rubik text-[24px] font-semibold leading-normal mb-3">
//             Nichehub list
//           </h4>
//           <p className="text-black font-open-sans text-base font-semibold leading-normal">
//             Nichehub posts
//           </p>
//         </div>
//         <div>
//           <RangePicker className="border-[#656562] border-[1px] h-[48px]" />
//         </div>
//       </div>

//       <div className="w-full">
//         <Table
//           columns={columns}
//           data={nicheHubListData}
//           isLoading={isLoading}
//         />
//       </div>

//       {meta && meta.total > 0 && (
//         <div className="flex w-full justify-end">
//           <Pagination
//             current={meta.page}
//             total={meta.total}
//             pageSize={limit}
//             onChange={handlePaginationChange}
//             showSizeChanger
//             showQuickJumper
//             pageSizeOptions={["10", "20", "25", "50"]}
//             className="ant-pagination-custom"
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default NichehubList;
"use client";
import {
  useGetNicheHubQuery,
  useDeleteNicheHubPostByAdminMutation,
} from "@/redux/features/niche_hub/nicheHubApi";
import { DatePicker, Pagination, Skeleton, Modal, message } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const { RangePicker } = DatePicker;

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  voteCount: number;
}

export interface Poll {
  id: string;
  nicheHubId: string;
  question: string;
  createdAt: string;
  updatedAt: string;
  options: PollOption[];
}

export interface UserStore {
  id: string;
  name: string;
  shopName: string;
  bannerImage: string;
  shopLogo: string;
  Follow: Array<{ followerId: string }>;
}

export interface User {
  id: string;
  fullName: string;
  profileImage: string;
  store?: UserStore[];
}

export interface NicheHubPost {
  id: string;
  title: string;
  fileUrl: string[];
  createdAt: string;
  likeCount: number;
  commentCount: number;
  visibility: "ALL" | "PRIVATE" | "FRIENDS";
  userId: string;
  Like: string[];
  user: User;
  Poll: Poll[];
}

interface Column {
  header: string;
  accessor: string;
  className?: string;
  render?: (row: NicheHubPost, index: number) => React.ReactNode;
}

const AVATAR_COLORS = [
  "#F97316",
  "#3B82F6",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F59E0B",
];

const getAvatarColor = (name: string) => {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

const NichehubList = () => {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // holds the row pending deletion; modal is open whenever this is non-null
  const [rowToDelete, setRowToDelete] = useState<NicheHubPost | null>(null);

  const { data, isLoading } = useGetNicheHubQuery({ page, limit });
  const [deleteNicheHub, { isLoading: isDeleting }] =
    useDeleteNicheHubPostByAdminMutation();

  const nicheHubListData: NicheHubPost[] = data?.result?.data || [];
  const meta = data?.result?.meta;

  const handleViewDetails = (row: NicheHubPost) => {
    router.push(
      `/dashboard/user-support-control/community-feedback/Nichehub-Details?id=${row.id}`,
    );
  };

  const handleDeleteClick = (row: NicheHubPost) => {
    setRowToDelete(row);
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setRowToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    try {
      await deleteNicheHub(rowToDelete.id).unwrap();
      message.success("Post deleted successfully");
      setRowToDelete(null);
    } catch {
      message.error("Failed to delete post");
    }
  };

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== limit) {
      setLimit(newPageSize);
      setPage(1);
    }
  };

  const columns: Column[] = [
    {
      header: "No.",
      accessor: "serial",
      className: "pl-4 pr-4 w-[56px]",
      render: (_row, index) => (
        <span className="font-medium text-black">
          {(page - 1) * limit + index + 1}
        </span>
      ),
    },
    {
      header: "Sellers Name",
      accessor: "sellersName",
      // Fixed max width + truncate so very long names never blow up the row height / table width.
      className: "pl-4 pr-6 max-w-[180px]",
      render: (row) => {
        const sellerImageUrl = row?.user?.profileImage || "";
        const sellerName = row?.user?.fullName || "Unknown Seller";
        const initial = sellerName.charAt(0).toUpperCase() || "U";

        return (
          <div className="flex items-center min-w-0">
            {sellerImageUrl ? (
              <Image
                src={sellerImageUrl}
                alt={sellerName}
                width={40}
                height={40}
                className="w-10 h-10 shrink-0 object-cover object-center rounded-full mr-3"
              />
            ) : (
              <div
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full mr-3 text-white font-semibold text-sm"
                style={{ backgroundColor: getAvatarColor(sellerName) }}
              >
                {initial}
              </div>
            )}
            <span
              className="font-medium text-black truncate"
              title={sellerName}
            >
              {sellerName}
            </span>
          </div>
        );
      },
    },
    {
      header: "Shop Name",
      accessor: "shopName",
      className: "px-6 max-w-[150px]",
      render: (row) => {
        const shopName = row?.user?.store?.[0]?.shopName || "N/A";
        return (
          <span
            className="text-black font-medium block truncate"
            title={shopName}
          >
            {shopName}
          </span>
        );
      },
    },
    {
      header: "Post Title",
      accessor: "title",
      className: "px-6 max-w-[220px] whitespace-normal",
      render: (row) => (
        <div
          className="line-clamp-2 break-words text-sm text-black"
          title={row.title}
        >
          {row.title || "No title provided"}
        </div>
      ),
    },
    {
      header: "Created At",
      accessor: "createdAt",
      className: "px-6 whitespace-nowrap",
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      header: "Likes",
      accessor: "likeCount",
      className: "px-4 text-center whitespace-nowrap",
      render: (row) => (
        <span className="font-medium text-black">{row.likeCount}</span>
      ),
    },
    {
      header: "Comments",
      accessor: "commentCount",
      className: "px-4 text-center whitespace-nowrap",
      render: (row) => (
        <span className="font-medium text-black">{row.commentCount}</span>
      ),
    },
    // {
    //   header: "Visibility",
    //   accessor: "visibility",
    //   className: "px-12",
    //   render: (row) => (
    //     <span className="inline-flex items-center rounded-full bg-black/10 px-3 py-1 text-xs font-medium capitalize text-black">
    //       {row.visibility.toLowerCase()}
    //     </span>
    //   ),
    // },
    {
      header: "Actions",
      accessor: "actions",
      className: "px-4 whitespace-nowrap",
      render: (row) => (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            className="rounded-[8px] bg-black/10 hover:bg-black/20 px-4 py-1.5 text-black font-medium text-sm transition-colors whitespace-nowrap"
            onClick={() => handleViewDetails(row)}
          >
            View
          </button>
          <button
            className="rounded-[8px] bg-red-500/10 hover:bg-red-500/20 px-4 py-1.5 text-red-600 font-medium text-sm transition-colors whitespace-nowrap"
            onClick={() => handleDeleteClick(row)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col items-start gap-8 sm:gap-12 lg:gap-[68px] p-4 sm:p-6 lg:p-[28px] pb-8 sm:pb-10 lg:pb-[48px] rounded-2xl lg:rounded-[16px] bg-white">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between w-full gap-4">
        <div>
          <h4 className="text-black font-rubik text-xl sm:text-2xl lg:text-[24px] font-semibold leading-normal mb-2 sm:mb-3">
            Community Reviews
          </h4>
          <p className="text-black/70 font-open-sans text-sm leading-normal">
            View feedback, reviews, and suggestions from the community to better
            understand user experiences and address concerns.
          </p>
        </div>
        <div className="w-full lg:w-auto">
          <RangePicker className="w-full lg:w-auto border-[#656562] border-[1px] h-11 sm:h-12" />
        </div>
      </div>

      <div className="w-full overflow-x-auto border-[1px] border-[#E6EFFF] rounded-[8px] bg-white">
        <table className="min-w-[900px] w-full divide-y divide-[#23232133]/20">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.accessor}
                  className={`px-2 sm:px-4 xl:px-6 py-4 sm:py-6 text-left text-sm sm:text-base font-normal font-inter text-[#232321CC]/80 tracking-wider whitespace-nowrap ${
                    index === 0 ? "pl-4" : ""
                  } ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#23232133]/20 text-black font-inter font-normal text-sm sm:text-base">
            {isLoading && nicheHubListData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-2 sm:px-4 xl:px-6 py-5 text-center"
                >
                  <Skeleton active avatar paragraph={{ rows: 12 }} />
                </td>
              </tr>
            ) : nicheHubListData.length > 0 ? (
              nicheHubListData.map((row, index) => (
                <tr key={row.id}>
                  {columns.map((column, colIndex) => (
                    <td
                      key={`${row.id}-${column.accessor}`}
                      className={`px-2 sm:px-4 xl:px-6 py-3 sm:py-4 align-middle ${
                        colIndex === 0 ? "pl-4" : ""
                      } ${column.className || ""}`}
                    >
                      {column.render ? column.render(row, index) : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-2 sm:px-4 xl:px-6 py-4 text-center text-sm text-gray-500"
                >
                  No Nichehub posts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.total > 0 && (
        <div className="flex w-full justify-center sm:justify-end overflow-x-auto">
          <Pagination
            current={meta.page}
            total={meta.total}
            pageSize={limit}
            onChange={handlePaginationChange}
            showSizeChanger
            showQuickJumper
            pageSizeOptions={["10", "20", "25", "50"]}
            className="ant-pagination-custom"
          />
        </div>
      )}

      {/* Declarative Modal rendered inside the tree — respects theme/context, no static-call warning */}
      <Modal
        open={!!rowToDelete}
        onCancel={handleCancelDelete}
        onOk={handleConfirmDelete}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: isDeleting }}
        cancelButtonProps={{ disabled: isDeleting }}
        title="Delete this post?"
        maskClosable={!isDeleting}
        closable={!isDeleting}
      >
        <p>
          {`"${
            rowToDelete?.title || "Untitled"
          }" will be permanently removed. This can't be undone.`}
        </p>
      </Modal>
    </div>
  );
};

export default NichehubList;
