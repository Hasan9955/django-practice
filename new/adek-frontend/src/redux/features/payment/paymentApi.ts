import { baseApi } from "../../api/baseApi";

const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation({
      query: (data) => ({
        url: `/payment/create`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["payment"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/payment/update-order-status/${orderId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["payment"],
    }),

    // seller payment data
    getSllerTotalEarnings: builder.query({
      query: () => ({
        url: `/payment/my-total-earnings`,
        method: "GET",
      }),
      providesTags: ["payment"],
    }),
    getSellerPaymentOrders: builder.query({
      query: (search) => ({
        url: `/payment/get-all-withdraw-requests`,
        method: "GET",
        params: search,
      }),
      providesTags: ["payment"],
    }),
    sellerWithdrawalRequest: builder.mutation({
      query: (data) => ({
        url: `/payment/withdraw-request`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["payment"],
    }),
    sellerWithdrawalRequestStatus: builder.mutation({
      query: ({ requestId, status }) => ({
        url: `/payment/update-request-status/${requestId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["payment"],
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
  useUpdateOrderStatusMutation,
  useGetSllerTotalEarningsQuery,
  useGetSellerPaymentOrdersQuery,
  useSellerWithdrawalRequestMutation,
  useSellerWithdrawalRequestStatusMutation,
} = productApi;
