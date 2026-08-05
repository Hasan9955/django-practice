import { baseApi } from "../../../api/baseApi";

const b2bProtalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getB2bDashboardStatic: builder.query({
      query: () => ({
        url: "/b2b-portal/get-b2b-dashboard-static",
        method: "GET",
      }),
      providesTags: ["b2bPackages"],
    }),
    getB2BChartAdminData: builder.query({
      query: () => ({
        url: "/b2b-portal/get-b2b-dashboard-chart",
        method: "GET",
      }),
      providesTags: ["b2bPackages"],
    }),
    getB2BAdminListings: builder.query({
      query: ({ page, limit , month ,search }) => ({
        url: "/b2b-portal/get-b2b-dashboard-listing",
        method: "GET",
        params: { page, limit, month, search },
      }),
      providesTags: ["b2bPackages"],
    }),
    getSellerB2BPackages: builder.query({
      query: () => ({
        url: "/b2b-portal/get-seller-b2b-packages",
        method: "GET",
      }),
      providesTags: ["b2bPackages"],
    }),
    getSellerB2BConversationsList: builder.query({
      query: ({ page, limit }) => ({
        url: "/b2b-portal/get-b2b-conversation",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["b2bConversations"],
    }),
    createB2BOffer: builder.mutation({
      query: (data) => ({
        url: "/b2b-offer/create-offer",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["b2bPackages"],
    }),
    getAllSellerB2BOffers: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/b2b-portal/get-seller-b2b-packages",
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["b2bPackages"],
    }),
    getMyB2BOffers: builder.query({
      query: () => ({
        url: "/b2b-offer/get-my-b2b-orders",
        method: "GET"
      }),
      providesTags: ["b2bPackages"],
    }),
    updateB2BOfferStatus: builder.mutation({
      query: (data) => ({
        url: `/b2b-offer/update-offer-status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["b2bPackages"],
    }),
  }),
});

export const {
  useGetB2bDashboardStaticQuery,
  useGetSellerB2BPackagesQuery,
  useGetSellerB2BConversationsListQuery,  
  useCreateB2BOfferMutation,
  useGetAllSellerB2BOffersQuery,
  useGetMyB2BOffersQuery,
  useUpdateB2BOfferStatusMutation,
  useGetB2BAdminListingsQuery,
  useGetB2BChartAdminDataQuery,

  
} = b2bProtalApi;
