import { useGetSellerPaymentOrdersQuery } from "@/redux/features/payment/paymentApi";
import { Skeleton } from "antd";
import Image from "next/image";
import { useMemo, useState } from "react";

const PaymentHistoryTable = () => {
  const [timeFilter, setTimeFilter] = useState("This month");

  const { data: response, isLoading } = useGetSellerPaymentOrdersQuery({});

  const filteredPayments = useMemo(() => {
    const payments = response?.result?.data ?? [];
    if (!Array.isArray(payments)) return [];

    const now = new Date();
    let startDate: Date;

    switch (timeFilter) {
      case "This month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "Last month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case "Last 3 months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "This year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    return payments.filter((p) => new Date(p.createdAt) >= startDate);
  }, [response, timeFilter]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>This month</option>
          <option>Last month</option>
          <option>Last 3 months</option>
          <option>This year</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Seller</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Transaction Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Bank / Account</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Image
                          src={payment?.seller?.profileImage || "/image.jpg"}
                          alt={payment?.seller?.fullName || "Seller"}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover bg-gray-100"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHJlY3QgZmlsbD0iI2VlZWVlZSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIi8+PC9zdmc+"
                          loading="lazy"
                          sizes="32px"
                          quality={75}
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            if (!img.dataset.fallback) {
                              img.src = "/image.jpg";
                              img.dataset.fallback = "true";
                            }
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{payment?.seller?.fullName}</p>
                          <p className="text-xs text-gray-400">{payment?.seller?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(payment.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-700">{payment.bankName}</p>
                      <p className="text-xs text-gray-400">{payment.accountNo}</p>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-800">
                      ${payment.amount}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                          payment.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : payment.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-sm text-gray-400">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryTable;