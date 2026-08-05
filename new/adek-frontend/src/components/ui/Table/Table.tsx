/* eslint-disable @typescript-eslint/no-explicit-any */
import { Coupon } from "@/components/pages/dashboard/adminDashboard/monetization&promotions/AllCouponManagement";
import { SellerType } from "@/components/pages/dashboard/adminDashboard/seller&store-oversight/ProductListings";
import { SellerSubscriptionsData } from "@/components/pages/dashboard/adminDashboard/seller&store-oversight/SellerSubscriptions";
import { Members } from "@/components/pages/dashboard/adminDashboard/user-support-control/AdminPermissionsControl";
import { RefundConversation } from "@/types/refund";
// import { NichebubList } from "@/components/pages/dashboard/adminDashboard/user-support-control/NichehubList";
import { Skeleton } from "antd";

export interface SubscriptionData {
  id?: number | string;
  username?: string;
  email?: string;
  days?: number;
  invoiceCode?: string;
  details?: string;
  status?: string;
  actionts?: string;
  action?: string;
}

interface Column<T = unknown> {
  header: string;
  accessor: string;
  render?: (data: T) => React.ReactNode;
  className?: string;
}

interface TableProps<
  T extends
    | SubscriptionData
    | SellerType
    | SellerSubscriptionsData
    | Members
    // | NichebubList
    | Coupon
    | RefundConversation,
> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  isLoading?: boolean;
  onAction?: (action: string, id: string) => void;
}

export const Table = <
  T extends
    | SubscriptionData
    | SellerType
    | SellerSubscriptionsData
    | Members
    // | NichebubList
    | Coupon
    | RefundConversation,
>({
  columns,
  data,
  emptyMessage,
  className = "",
  isLoading,
}: TableProps<T>) => {
  return (
    <div
      className={`overflow-x-auto border-[1px] border-[#E6EFFF] rounded-[8px] bg-white ${className}`}
    >
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
        <tbody className="divide-y divide-[#23232133]/20 text-black  font-inter font-normal text-base">
          {isLoading && data?.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-1 xl:px-6 py-5 text-center"
              >
                <Skeleton active avatar paragraph={{ rows: 12 }} />
              </td>
            </tr>
          ) : data?.length > 0 ? (
            data?.map((row, index) => {
              const rowId = (row as any)?.id ?? index;
              return (
                <tr key={rowId}>
                  {columns?.map((column, colIndex) => (
                    <td
                      key={`${rowId}-${String(column.accessor)}`}
                      className={`px-1 xl:px-6 py-4 whitespace-nowrap xl:mx-6 mx-2 ${
                        colIndex === 0 ? "pl-4" : ""
                      } ${column.className || ""}`}
                    >
                      {column.render
                        ? column.render(row)
                        : ((row as Record<string, unknown>)[
                            column.accessor
                          ] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-1 xl:px-6 py-4 text-center text-sm text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
