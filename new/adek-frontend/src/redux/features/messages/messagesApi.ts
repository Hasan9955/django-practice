import { baseApi } from "../../api/baseApi";

const newsLetterManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversationList: builder.query({
      query: () => ({
        url: "/chat/conversation-list",
        method: "GET",
      }),
      providesTags: ["messages"],
    }),
    singleConversation: builder.query({
      query: ({ conversationId, page, limit , chatType }) => ({
        url: `/chat/get-single-message/${conversationId}`,
        method: "GET",
        params: { page, limit , chatType },
      }),
      providesTags: ["messages"],
    }),
  }),
});

export const { useGetConversationListQuery, useSingleConversationQuery } =
  newsLetterManagementApi;
