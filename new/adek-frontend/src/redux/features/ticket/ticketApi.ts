import { baseApi } from "../../api/baseApi";

const ticketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTicket: builder.mutation({
      query: (data) => ({
        url: `/ticket/create-ticket`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["tickets"],
    }),
    getAllTickets: builder.query({
      query: () => ({
        url: `/ticket/get-my-ticket-conversation`,
        method: "GET",
      }),
      providesTags: ["tickets"],
    }),
    getAllTicketConversations: builder.query({
      query: () => ({
        url: `/ticket/get-all-ticket-conversation`,
        method: "GET",
      }),
      providesTags: ["tickets"],
    }),
    getSingleTicketMessage: builder.query({
      query: (ticketId) => ({
        url: `/ticket/get-single-ticket-message/${ticketId}`,
        method: "GET",
      }),
      providesTags: ["tickets"],
    }),
    updateTicketStatus: builder.mutation({
      query: ({ ticketId, status }) => ({
        url: `/ticket/update-ticket-status/${ticketId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["tickets"],
    }),
    ticketMessagesAsRead: builder.mutation({
      query: ({ ticketId }) => ({
        url: `/ticket/message-status/${ticketId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["tickets"],
    }),
    updatedTicketStatus: builder.mutation({
      query: (data) => ({
        url: "/ticket/update-ticket-status",
        method: "PATCH",
        body: { data },
      }),
      invalidatesTags: ["tickets"],
    }),
  }),
});

export const {
  useCreateTicketMutation,
  useGetAllTicketsQuery,
  useGetAllTicketConversationsQuery,
  useGetSingleTicketMessageQuery,
  useUpdateTicketStatusMutation,
  useTicketMessagesAsReadMutation,
  useUpdatedTicketStatusMutation,
} = ticketApi;
