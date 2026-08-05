/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React, { useState, useEffect } from "react";

// import {
//   Table,
//   Input,
//   Card,
//   Avatar,
//   Typography,
//   Space,
//   Tag,
//   Pagination,
//   Spin,
//   Alert,
//   Button,
//   Select,
// } from "antd";
// import type { ColumnsType } from "antd/es/table";
// import {
//   SearchOutlined,
//   ReloadOutlined,
//   UserOutlined,
// } from "@ant-design/icons";

// import { useGetAllUserQuery } from "@/redux/features/auth/authApi";

// const { Search } = Input;
// const { Title } = Typography;

// // ==================== STRICT TYPES (matches real API payload) ====================
// interface User {
//   id: string;
//   fullName: string;
//   email: string;
//   phoneNumber: string;
//   coverPhoto: string;
//   profileImage: string;
//   location: string | null;
//   zipCode: string | null;
//   companyName: string;
//   status: "ACTIVE";
//   role: "USER" | "SELLER";
// }

// interface Meta {
//   page: number;
//   limit: number;
//   total: number;
//   totalPage: number;
// }

// interface ApiResponse {
//   success: boolean;
//   message: string;
//   result: {
//     meta: Meta;
//     data: User[];
//   };
// }

// type RoleFilter = "ALL" | "USER" | "SELLER";
// // ============================================================

// const UsersPage = () => {
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
//   const pageSize = 10;

//   // Debounced search (prevents API spam)
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//       setCurrentPage(1);
//     }, 400);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   // Reset to page 1 whenever the role filter changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [roleFilter]);

//   // ==================== MAIN TABLE QUERY ====================
//   const {
//     data: rawData,
//     isLoading,
//     isFetching,
//     error,
//     refetch,
//   } = useGetAllUserQuery({
//     search: debouncedSearchTerm || undefined,
//     page: currentPage,
//     limit: pageSize,
//     ...(roleFilter !== "ALL" ? { role: roleFilter } : {}),
//   });

//   const data = rawData as ApiResponse | undefined;

//   const users: User[] = data?.result?.data ?? [];
//   const meta: Meta | undefined = data?.result?.meta;

//   const columns: ColumnsType<User> = [
//     {
//       title: "Profile",
//       key: "avatar",
//       width: 80,
//       render: (_, record: User) => (
//         <Avatar
//           src={record.profileImage || undefined}
//           icon={!record.profileImage ? <UserOutlined /> : undefined}
//           size={48}
//         >
//           {record.fullName?.substring(0, 2).toUpperCase()}
//         </Avatar>
//       ),
//     },
//     {
//       title: "Full Name",
//       dataIndex: "fullName",
//       key: "fullName",
//       render: (text: string) => <span className="font-medium">{text}</span>,
//     },
//     {
//       title: "Email",
//       dataIndex: "email",
//       key: "email",
//     },
//     {
//       title: "Phone Number",
//       dataIndex: "phoneNumber",
//       key: "phoneNumber",
//     },
//     {
//       title: "Company",
//       dataIndex: "companyName",
//       key: "companyName",
//       render: (text: string) => (text?.trim() ? text : "—"),
//     },
//     {
//       title: "Location",
//       dataIndex: "location",
//       key: "location",
//       render: (location: string | null, record: User) =>
//         location ? (
//           <Space direction="vertical" size={0}>
//             <Tag color="blue">{location}</Tag>
//             {record.zipCode && (
//               <span className="text-xs text-gray-500">{record.zipCode}</span>
//             )}
//           </Space>
//         ) : (
//           "—"
//         ),
//     },
//     {
//       title: "Status",
//       key: "status",
//       width: 100,
//       render: (_, record: User) => (
//         <Tag color="success" className="font-medium">
//           {record.status}
//         </Tag>
//       ),
//     },
//     {
//       title: "Role",
//       key: "role",
//       width: 110,
//       render: (_, record: User) => (
//         <Tag
//           color={record.role === "SELLER" ? "purple" : "default"}
//           className="font-medium"
//         >
//           {record.role === "SELLER" ? "Seller" : "Buyer"}
//         </Tag>
//       ),
//     },
//   ];

//   const handleSearch = (value: string) => {
//     setSearchTerm(value);
//   };

//   const handleRefresh = () => {
//     refetch();
//   };

//   if (error) {
//     return (
//       <div className="p-6 max-w-7xl mx-auto">
//         <Alert
//           message="Failed to load users"
//           description="Something went wrong while fetching the user list. Please try again."
//           type="error"
//           showIcon
//           action={
//             <Button type="primary" icon={<ReloadOutlined />} onClick={refetch}>
//               Retry
//             </Button>
//           }
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-full mx-auto">
//       <Card>
//         {/* Header + Search */}
//         <div className="flex justify-between items-center mb-6 px-6 pt-6">
//           <Title level={3} style={{ marginBottom: 0 }}>
//             All Users
//           </Title>

//           <div className="flex items-center gap-x-3">
//             <Button
//               className="py-[18px]"
//               icon={<ReloadOutlined spin={isFetching} />}
//               onClick={handleRefresh}
//               loading={isFetching}
//             >
//               Refresh
//             </Button>

//             <Select
//               value={roleFilter}
//               onChange={(value) => setRoleFilter(value as RoleFilter)}
//               style={{ width: 160 }}
//               size="large"
//               options={[
//                 { label: "All Roles", value: "ALL" },
//                 { label: "Buyer", value: "USER" },
//                 { label: "Seller", value: "SELLER" },
//               ]}
//             />

//             <Search
//               placeholder="Search by name or email..."
//               allowClear
//               onSearch={handleSearch}
//               onChange={(e) => {
//                 if (e.target.value === "") handleSearch("");
//               }}
//               style={{ width: 340 }}
//               size="large"
//               prefix={<SearchOutlined />}
//             />
//           </div>
//         </div>

//         {/* Main Table with Ant Design loading spinner */}
//         <Spin
//           spinning={isLoading || isFetching}
//           tip="Loading users..."
//           size="large"
//         >
//           <Table
//             columns={columns}
//             dataSource={users}
//             rowKey="id"
//             pagination={false}
//             scroll={{ x: "max-content" }}
//             bordered
//           />
//         </Spin>

//         {/* Pagination footer – hidden while loading */}
//         {!isLoading && meta && (
//           <div className="flex justify-between items-center mt-6 px-6 pb-6">
//             <Space>
//               <span className="text-gray-500">
//                 Showing {(currentPage - 1) * pageSize + 1}-
//                 {Math.min(currentPage * pageSize, meta.total)} of {meta.total}{" "}
//                 users
//               </span>
//               <span className="text-gray-500">
//                 • Page {meta.page} of {meta.totalPage}
//               </span>
//             </Space>

//             <Pagination
//               current={meta.page}
//               total={meta.total}
//               pageSize={meta.limit}
//               onChange={(page) => setCurrentPage(page)}
//               showSizeChanger={false}
//               showQuickJumper
//             />
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default UsersPage;
"use client";

import React, { useState, useEffect } from "react";

import {
  Input,
  Card,
  Avatar,
  Typography,
  Space,
  Tag,
  Pagination,
  Alert,
  Button,
  Select,
  Skeleton,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import {
  useGetAllUserQuery,
  useUserDeleteMutation,
} from "@/redux/features/auth/authApi";

const { Search } = Input;
const { Title } = Typography;

// ==================== TYPES ====================
interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  coverPhoto: string;
  profileImage: string;
  location: string | null;
  zipCode: string | null;
  companyName: string;
  // Not present in the sample API response — kept optional so the UI
  // degrades gracefully instead of crashing if the backend omits them.
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  role?: "USER" | "SELLER";
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  result: {
    meta: Meta;
    data: User[];
  };
}

type RoleFilter = "ALL" | "USER" | "SELLER";

interface Column {
  header: string;
  accessor: string;
  render?: (record: User) => React.ReactNode;
  className?: string;
}
// ============================================================

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Plain, framework-free confirmation modal + toast state
  const [pendingDeleteUser, setPendingDeleteUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const pageSize = 10;

  // Auto-dismiss the toast after a few seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Debounced search (prevents API spam)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 whenever the role filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter]);

  // ==================== MAIN TABLE QUERY ====================
  const {
    data: rawData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAllUserQuery({
    search: debouncedSearchTerm || undefined,
    page: currentPage,
    limit: pageSize,
    ...(roleFilter !== "ALL" ? { role: roleFilter } : {}),
  });

  const [deleteUser, { isLoading: isDeleteInFlight }] = useUserDeleteMutation();

  const data = rawData as ApiResponse | undefined;
  const users: User[] = data?.result?.data ?? [];
  const meta: Meta | undefined = data?.result?.meta;

  // If deleting the last row on a page (other than page 1), step back a page
  // so the user isn't left staring at an empty page.
  useEffect(() => {
    if (!isFetching && meta && users.length === 0 && currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  }, [isFetching, meta, users.length, currentPage]);

  const handleSearch = (value: string) => setSearchTerm(value);
  const handleRefresh = () => refetch();

  const confirmDelete = (user: User) => {
    setPendingDeleteUser(user);
  };

  const cancelDelete = () => setPendingDeleteUser(null);

  const performDelete = async () => {
    if (!pendingDeleteUser) return;
    const user = pendingDeleteUser;
    try {
      setDeletingId(user.id);
      const res = await deleteUser(user.id).unwrap();
      setToast({
        type: "success",
        text: res?.message || `"${user.fullName}" was deleted successfully.`,
      });
      refetch();
    } catch (err: any) {
      // Log the raw error so the real cause (wrong URL, wrong method,
      // 401/403, validation error, etc.) shows up in the console
      // instead of being hidden behind a generic toast.
      console.error("Delete user failed:", err);
      const backendMessage =
        err?.data?.message || err?.error || "Please try again.";
      setToast({
        type: "error",
        text: `Failed to delete user: ${backendMessage}`,
      });
    } finally {
      setDeletingId(null);
      setPendingDeleteUser(null);
    }
  };

  // Row number continues across pages: (page - 1) * pageSize + index + 1
  const columns: Column[] = [
    {
      header: "#",
      accessor: "serial",
      className: "w-12",
      render: (record: User) => {
        const idx = users.findIndex((u) => u.id === record.id);
        return (
          <span className="font-medium text-gray-500">
            {(currentPage - 1) * pageSize + idx + 1}
          </span>
        );
      },
    },
    {
      header: "Profile",
      accessor: "avatar",
      render: (record: User) => (
        <Avatar
          src={record.profileImage || undefined}
          icon={!record.profileImage ? <UserOutlined /> : undefined}
          size={48}
        >
          {record.fullName?.substring(0, 2).toUpperCase()}
        </Avatar>
      ),
    },
    {
      header: "Full Name",
      accessor: "fullName",
      render: (record: User) => (
        <span className="font-medium">{record.fullName}</span>
      ),
    },
    {
      header: "Email",
      accessor: "email",
      render: (record: User) => record.email,
    },
    {
      header: "Phone Number",
      accessor: "phoneNumber",
      render: (record: User) => record.phoneNumber,
    },
    {
      header: "Company",
      accessor: "companyName",
      render: (record: User) =>
        record.companyName?.trim() ? record.companyName : "—",
    },
    {
      header: "Location",
      accessor: "location",
      render: (record: User) =>
        record.location ? (
          <Space direction="vertical" size={0}>
            <Tag color="blue">{record.location}</Tag>
            {record.zipCode && (
              <span className="text-xs text-gray-500">{record.zipCode}</span>
            )}
          </Space>
        ) : (
          "—"
        ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (record: User) => (
        <Tag
          color={record.status === "ACTIVE" ? "success" : "default"}
          className="font-medium"
        >
          {record.status ?? "—"}
        </Tag>
      ),
    },
    {
      header: "Role",
      accessor: "role",
      render: (record: User) => (
        <Tag
          color={record.role === "SELLER" ? "purple" : "default"}
          className="font-medium"
        >
          {record.role === "SELLER" ? "Seller" : "Buyer"}
        </Tag>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (record: User) => {
        const isThisRowDeleting = isDeleteInFlight && deletingId === record.id;
        return (
          <Button
            danger
            size="small"
            icon={isThisRowDeleting ? <LoadingOutlined /> : <DeleteOutlined />}
            disabled={isDeleteInFlight}
            loading={isThisRowDeleting}
            onClick={() => confirmDelete(record)}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Alert
          message="Failed to load users"
          description="Something went wrong while fetching the user list. Please try again."
          type="error"
          showIcon
          action={
            <Button type="primary" icon={<ReloadOutlined />} onClick={refetch}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full mx-auto">
      <Card>
        {/* Header + Search + Filter */}
        <div className="flex justify-between items-center mb-6 px-6 pt-6 flex-wrap gap-y-3">
          <Title level={3} style={{ marginBottom: 0 }}>
            All Users
          </Title>

          <div className="flex items-center gap-x-3 flex-wrap gap-y-2">
            <Button
              className="py-[18px]"
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={handleRefresh}
              loading={isFetching}
            >
              Refresh
            </Button>

            <Select
              value={roleFilter}
              onChange={(value) => setRoleFilter(value as RoleFilter)}
              style={{ width: 160 }}
              size="large"
              options={[
                { label: "All Roles", value: "ALL" },
                { label: "Buyer", value: "USER" },
                { label: "Seller", value: "SELLER" },
              ]}
            />

            <Search
              placeholder="Search by name or email..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => {
                if (e.target.value === "") handleSearch("");
              }}
              style={{ width: 340 }}
              size="large"
              prefix={<SearchOutlined />}
            />
          </div>
        </div>

        {/* Table — built inline so this whole page is one self-contained component */}
        <div className="px-6">
          <div className="overflow-x-auto border-[1px] border-[#E6EFFF] rounded-[8px] bg-white">
            <table className="min-w-full divide-y divide-[#23232133]/20">
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={column.accessor}
                      className={`px-1 xl:px-6 py-6 text-left text-base font-normal font-inter text-[#232321CC]/80 tracking-wider ${
                        index === 0 ? "pl-4" : ""
                      } ${column.className || ""}`}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23232133]/20 text-black font-inter font-normal text-base">
                {(isLoading || isFetching) && users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-1 xl:px-6 py-5 text-center"
                    >
                      <Skeleton active avatar paragraph={{ rows: 12 }} />
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((record) => (
                    <tr key={record.id}>
                      {columns.map((column, colIndex) => (
                        <td
                          key={`${record.id}-${column.accessor}`}
                          className={`px-1 xl:px-6 py-4 whitespace-nowrap xl:mx-6 mx-2 ${
                            colIndex === 0 ? "pl-4" : ""
                          } ${column.className || ""}`}
                        >
                          {column.render
                            ? column.render(record)
                            : ((record as unknown as Record<string, unknown>)[
                                column.accessor
                              ] as React.ReactNode)}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-1 xl:px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination footer – hidden while the initial load is in flight */}
        {!isLoading && meta && (
          <div className="flex justify-between items-center mt-6 px-6 pb-6 flex-wrap gap-y-3">
            <Space>
              <span className="text-gray-500">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, meta.total)} of {meta.total}{" "}
                users
              </span>
              <span className="text-gray-500">
                • Page {meta.page} of {meta.totalPage}
              </span>
            </Space>

            <Pagination
              current={meta.page}
              total={meta.total}
              pageSize={meta.limit}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              showQuickJumper
            />
          </div>
        )}
      </Card>

      {/* ==================== Plain confirmation modal (no UI library) ==================== */}
      {pendingDeleteUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={cancelDelete}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Delete this user?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              You&apos;re about to permanently delete{" "}
              <span className="font-medium text-gray-900">
                {pendingDeleteUser.fullName}
              </span>{" "}
              ({pendingDeleteUser.email}). This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={isDeleteInFlight}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performDelete}
                disabled={isDeleteInFlight}
                className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleteInFlight && <LoadingOutlined className="text-white" />}
                {isDeleteInFlight ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== Plain toast (no UI library) ==================== */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
};

export default UsersPage;
