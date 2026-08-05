import { baseApi } from "../../../api/baseApi";

const sellerDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSellerDashboardStats: builder.query({
      query: () => ({
        url: "/seller-dashboard/get-seller-dashboard-data",
        method: "GET",
      }),
      providesTags: ["sellerDashboard"],
    }),
    getSellerSalesAnalytics: builder.query({
      query: (filter) => ({
        url: "/seller-dashboard/get-seller-sales-analytics",
        method: "GET",
        params: filter,
      }),
      providesTags: ["sellerDashboard"],
    }),
    getSellerRevenueAnalytics: builder.query({
      query: (filter) => ({
        url: "/seller-dashboard/get-seller-revenue-analytics",
        method: "GET",
        params: filter,
      }),
      providesTags: ["sellerDashboard"],
    }),
    getSellerPaymentData: builder.query({
      query: () => ({
        url: "/seller-dashboard/get-seller-payment-data",
        method: "GET",
      }),
      providesTags: ["sellerDashboard"],
    }),
    getSellerSubscriptionPlans: builder.query({
      query: () => ({
        url: "/subscriptions/get-subscription",
        method: "GET",
      }),
      providesTags: ["sellerDashboard"],
    }),
    buySellerSubscriptionPlan: builder.mutation({
      query: (subscriptionData) => ({
        url: "/subscriptions/purchase-subscription",
        method: "POST",
        body: subscriptionData,
      }),
      invalidatesTags: ["sellerDashboard"],
    }),
    getSellerCoupons: builder.query({
      query: (storeId) => ({
        url: `/coupon/my-coupons/${storeId}`,
        method: "GET",
      }),
      providesTags: ["coupon"],
    }),
    createSellerCoupon: builder.mutation({
      query: (couponData) => ({
        url: `/coupon/create-coupon`,
        method: "POST",
        body: couponData,
      }),
      invalidatesTags: ["coupon"],
    }),
    updateSellerCoupon: builder.mutation({
      query: ({ id, data }) => ({
        url: `/coupon/update-coupon/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["coupon"],
    }),
    deleteSellerCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupon/delete-coupon/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["coupon"],
    }),

    returnSellerProductList: builder.query({
      query: () => ({
        url: "/payment/get-all-withdraw-requests",
        method: "GET",
      }),
      providesTags: ["sellerDashboard"],
    }),
    getSellerRefundConversationList: builder.query({
      query: (refundStatus) => ({
        url: `/refund/refund-conversation-list?refundStatus=${refundStatus}`,
        method: "GET",
      }),
      providesTags: ["sellerDashboard"],
    }),
    getSellerReviews: builder.query({
      query: () => ({
        url: "/reviews/get-seller-reviews",
        method: "GET",
      }),
      providesTags: ["sellerDashboard"],
    }),
    createSellerShippingOptions: builder.mutation({
      query: (shippingData) => ({
        url: "/seller-dashboard/create-shipping-options",
        method: "POST",
        body: shippingData,
      }),
      invalidatesTags: ["sellerDashboard"],
    }),
    getSellerShippingOptions: builder.query({
      query: (storeId) => ({
        url: `/seller-dashboard/get-shipping-options/${storeId}`,
        method: "GET",
      }),
      providesTags: ["sellerDashboard"],
    }),
    getOrderDetails: builder.query({
      query: (orderId) => ({
        url: `/payment/order-details/${orderId}`,
        method: "GET",
      }),
      providesTags: ["sellerDashboard"],
    }),
  }),
});

export const {
  useGetSellerDashboardStatsQuery,
  useGetSellerSalesAnalyticsQuery,
  useGetSellerRevenueAnalyticsQuery,
  useGetSellerPaymentDataQuery,
  useGetSellerSubscriptionPlansQuery,
  useBuySellerSubscriptionPlanMutation,
  useGetSellerCouponsQuery,
  useCreateSellerCouponMutation,
  useUpdateSellerCouponMutation,
  useDeleteSellerCouponMutation,
  useReturnSellerProductListQuery,
  useGetSellerRefundConversationListQuery,
  useGetSellerReviewsQuery,
  useCreateSellerShippingOptionsMutation,
  useGetOrderDetailsQuery,
  useGetSellerShippingOptionsQuery,
} = sellerDashboardApi;
