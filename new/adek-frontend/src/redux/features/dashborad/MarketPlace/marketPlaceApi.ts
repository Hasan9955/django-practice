import { baseApi } from "../../../api/baseApi";

const marketPlaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMarketPlaceSalesChart: builder.query({
      query: (filter) => ({
        url: "/admin-dashboard/market-place-sales-chart",
        method: "GET",
        params: filter,
      }),
      providesTags: ["marketPlace"],
    }),

    getNewListedProducts: builder.query({
      query: () => ({
        url: "/admin-dashboard/new-listed-products",
        method: "GET",
      }),
      providesTags: ["marketPlace"],
    }),
    getMarketPlaceRevenueChart: builder.query({
      query: (filter) => ({
        url: "/admin-dashboard/market-place-revenue-chart",
        method: "GET",
        params: filter,
      }),
      providesTags: ["marketPlace"],
    }),
    getMarketPlaceHealthData: builder.query({
      query: () => ({
        url: "/admin-dashboard/get-market-place-health-data",
        method: "GET",
      }),
      providesTags: ["marketPlace"],
    }),
  }),
});

export const {
  useGetMarketPlaceSalesChartQuery,
  useGetNewListedProductsQuery,
  useGetMarketPlaceRevenueChartQuery,
  useGetMarketPlaceHealthDataQuery,
} = marketPlaceApi;
