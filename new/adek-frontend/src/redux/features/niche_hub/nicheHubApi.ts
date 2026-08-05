import { baseApi } from "../../api/baseApi";

const nicheHubApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNicheHub: builder.query({
      query: ({ search, filter, page, limit }) => ({
        url: "/niche-hub/get-all-niche-hub-posts",
        method: "GET",
        params: { search, filter, page, limit },
      }),
      providesTags: ["nicheHub"],
    }),
    getSingleNicheHubPost: builder.query({
      query: (postId) => ({
        url: `/niche-hub/get-single-niche-hub-post/${postId}`,
        method: "GET",
      }),
      providesTags: ["nicheHub"],
    }),
    createNicheHubPost: builder.mutation({
      query: (formData) => ({
        url: "/niche-hub/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["nicheHub"],
    }),
    DeleteNicheHub: builder.mutation({
      query: (id) => ({
        url: `/niche-hub/detete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["nicheHub"],
    }),

    deleteNicheHubPostByAdmin: builder.mutation({
      query: (id) => ({
        url: `/niche-hub/delete-niche-hub-post-by-admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["nicheHub"],
    }),

    editNicheHubPost: builder.mutation({
      query: ({ postId, formData }) => ({
        url: `/niche-hub/update-niche-hub-post/${postId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["nicheHub"],
    }),
    toggleLikeNicheHubPost: builder.mutation({
      query: (nicheHubId) => ({
        url: `/likes/toggle-like/${nicheHubId}`,
        method: "POST",
      }),
      invalidatesTags: ["nicheHub"],
    }),
    getLikeUserNicheHubPost: builder.query({
      query: (nicheHubId) => ({
        url: `/likes/get-like-user/${nicheHubId}`,
        method: "GET",
      }),
      providesTags: ["nicheHub"],
    }),
    createComment: builder.mutation({
      query: (commentData) => ({
        url: "/comments/create-comment",
        method: "POST",
        body: commentData,
      }),
      invalidatesTags: ["nicheHub"],
    }),
    getComments: builder.query({
      query: (nicheHubId) => ({
        url: `/comments/get-comments/${nicheHubId}`,
        method: "GET",
      }),
      providesTags: ["nicheHub"],
    }),
    createFollow: builder.mutation({
      query: (followData) => ({
        url: "/follow/create-follow",
        method: "POST",
        body: followData,
      }),
      invalidatesTags: ["nicheHub"],
    }),
    getMyFollowings: builder.query({
      query: () => ({
        url: "/follow/get-my-followings",
        method: "GET",
      }),
      providesTags: ["nicheHub"],
    }),
    getStoreFollowers: builder.query({
      query: (storeId) => ({
        url: `/follow/get-store-followers/${storeId}`,
        method: "GET",
      }),
      providesTags: ["nicheHub"],
    }),
    createShare: builder.mutation({
      query: (shareData) => ({
        url: "/share/create-share",
        method: "POST",
        body: shareData,
      }),
      invalidatesTags: ["nicheHub"],
    }),
    getShares: builder.query({
      query: (nicheHubId) => ({
        url: `/share/get-shares/${nicheHubId}`,
        method: "GET",
      }),
      providesTags: ["nicheHub"],
    }),
    voteInPoll: builder.mutation({
      query: (voteData) => ({
        url: "/niche-hub/vote-in-poll",
        method: "POST",
        body: voteData,
      }),
      invalidatesTags: ["nicheHub"],
    }),
  }),
});

export const {
  useGetNicheHubQuery,
  useGetSingleNicheHubPostQuery,
  useCreateNicheHubPostMutation,
  useToggleLikeNicheHubPostMutation,
  useGetLikeUserNicheHubPostQuery,
  useCreateCommentMutation,
  useGetCommentsQuery,
  useCreateFollowMutation,
  useGetMyFollowingsQuery,
  useCreateShareMutation,
  useGetSharesQuery,
  useVoteInPollMutation,
  useEditNicheHubPostMutation,
  useGetStoreFollowersQuery,
  useDeleteNicheHubMutation,
  useDeleteNicheHubPostByAdminMutation,
} = nicheHubApi;
