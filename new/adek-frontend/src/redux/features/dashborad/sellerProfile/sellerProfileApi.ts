import { baseApi } from "../../../api/baseApi";

const sellerProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => ({
        url: "/store/my-store",
        method: "GET",
      }),
      providesTags: ["sellerProfile"],
    }),
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: "/store/update-store",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["sellerProfile"],
    }),
    getSellerProductsById: builder.query({
      query: (sellerId) => ({
        url: `/admin-dashboard/get-seller-products/${sellerId}`,
        method: "GET",
      }),
      providesTags: ["sellerProfile"],
    }),
    // admin seller performance
    getSellerPerformance: builder.query({
      query: (sellerId) => ({
        url: `/admin-dashboard/seller-performance/${sellerId}`,
        method: "GET",
      }),
      providesTags: ["sellerProfile"],
    }),
    getSellerOdersTable: builder.query({
      query: ({ sellerId, limit, page }) => ({
        url: `/admin-dashboard/get-order-table/${sellerId}`,
        method: "GET",
        params: { limit, page },
      }),
      providesTags: ["sellerProfile"],
    }),
    getSellerSellsChart: builder.query({
      query: ({ sellerId, filter }) => ({
        url: `/admin-dashboard/seller-insight-chart/${sellerId}`,
        method: "GET",
        params: { filter },
      }),
      providesTags: ["sellerProfile"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetSellerProductsByIdQuery,
  useGetSellerPerformanceQuery,
  useGetSellerOdersTableQuery,
  useGetSellerSellsChartQuery,
} = sellerProfileApi;
