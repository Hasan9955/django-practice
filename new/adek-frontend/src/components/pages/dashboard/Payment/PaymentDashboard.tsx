"use client";

import { useState } from "react";
import PaymentHistoryTable from "./PaymentHistoryTable";
import {
  useGetSellerPaymentDataQuery,
  useGetSellerRevenueAnalyticsQuery,
} from "@/redux/features/dashborad/sellerdashboard/sellerDashboardApi";
import RevenueChart from "./RevenueChart";
import StatCard from "@/components/ui/Card/StatCard";
import SellerPayment from "./SellerPayment";

export default function PaymentDashboard() {
  const [timeFilter, setTimeFilter] = useState("");

  const { data, isLoading: isLoadingPayment } = useGetSellerPaymentDataQuery({});
  const { data: revenue, isLoading: isLoadingRevenue } =
    useGetSellerRevenueAnalyticsQuery({ filter: timeFilter });

  const sellerPaymentData = data?.result;
  const revenueAnalytics = revenue?.result;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total available product"
          value={sellerPaymentData?.totalProduct}
          subtitle="Total products are available"
          trend="up"
          isLoading={isLoadingPayment}
        />
        <StatCard
          title="Total revenue"
          value={sellerPaymentData?.totalRevenue}
          subtitle="Stunning transition"
          trend="up"
          isLoading={isLoadingPayment}
        />
        <StatCard
          title="New order"
          value={sellerPaymentData?.newOrder}
          subtitle="New order are available"
          trend="up"
          isLoading={isLoadingPayment}
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart
        data={revenueAnalytics}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        loading={isLoadingRevenue}
      />

      {/* Seller Payment */}
      <SellerPayment />

      {/* Payment History */}
      <PaymentHistoryTable />
    </div>
  );
}