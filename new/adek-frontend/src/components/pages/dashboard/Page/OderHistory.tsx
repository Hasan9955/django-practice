/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/Button/Button";
import Image from "next/image";
import { useGetSellerDashboardStatsQuery } from "@/redux/features/dashborad/sellerdashboard/sellerDashboardApi";
import { useRouter } from "next/navigation";

export default function OrderHistory() {
  const router = useRouter();
  const { data } = useGetSellerDashboardStatsQuery({});
  const orders = data?.result?.orders;
  return (
    <div className="w-full mx-auto p-4 bg-white rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
        <Button
          variant="link"
          onClick={() => router.push("/dashboard/order-list")}
          className="text-blue-600 hover:text-blue-800 cursor-pointer p-0"
        >
          See All
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount Paid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STATUS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders?.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Image
                    src={order?.variant?.product?.productPhoto?.[0]}
                    alt={
                      order?.variant?.product?.productName || "Product image"
                    }
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-md object-cover bg-gray-100"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+"
                    loading="lazy"
                    sizes="48px"
                    quality={75}
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallback) {
                        img.src =
                          "https://img.freepik.com/free-photo/red-hardcover-book-front-cover_1101-833.jpg";
                        img.dataset.fallback = "true";
                      }
                    }}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {order?.variant?.product?.productName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order?.price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize
					${
            order?.orderStatus === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : order?.orderStatus === "processing"
              ? "bg-blue-100 text-blue-700"
              : order?.orderStatus === "Shipped"
              ? "bg-green-100 text-green-700"
              : order?.orderStatus === "cancelled"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-700"
          }`}
                  >
                    {order?.orderStatus || "Unknown"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(order?.createdAt).toLocaleString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
