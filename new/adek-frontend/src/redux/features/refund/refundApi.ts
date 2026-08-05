import { baseApi } from "../../api/baseApi";

const refundApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRefund: builder.mutation({
      query: (data) => ({
        url: `/refund/create-refund-conversation`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["refunds"],
    }),
    getAllRefund: builder.query({
      query: () => ({
        url: `/refund/refund-conversation-list`,
        method: "GET",
      }),
      providesTags: ["refunds"],
    }),
    getSingleRefundMessages: builder.query({
      query: ({ refundConversationId }: { refundConversationId: string }) => ({
        url: `/refund/get-single-refund-message/${refundConversationId}`,
        method: "GET",
      }),
      providesTags: ["refunds"],
    }),
    updateRefundStatus: builder.mutation({
      query: (data) => ({
        url: `/refund/update-refund-status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["refunds"],
    }),
    updateMessageStatus: builder.mutation({
      query: (refundId: string) => ({
        url: `/refund/message-status/${refundId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["refunds"],
    }),
    getAllRefundAdmin: builder.query({
      query: () => ({
        url: `/refund/refund-conversation-list-for-admin`,
        method: "GET",
      }),
      providesTags: ["refunds"],
    }),
  }),
});

export const {
  useCreateRefundMutation,
  useGetAllRefundQuery,
  useGetSingleRefundMessagesQuery,
  useUpdateRefundStatusMutation,
  useUpdateMessageStatusMutation,
  useGetAllRefundAdminQuery,
} = refundApi;
