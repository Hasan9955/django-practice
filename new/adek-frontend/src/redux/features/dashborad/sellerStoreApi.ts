import { baseApi } from "../../api/baseApi";

const sellerStoreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // getStoreAll: builder.query({
    //   query: () => ({
    //     url: "/store/all-store",
    //     method: "GET",
    //   }),
    //   providesTags: ["sellerStore"],
    // }),
    getStoreAll: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params?.search) {
          queryParams.append("search", params.search);
        }
        if (params?.status && params.status !== "All") {
          queryParams.append("status", params.status);
        }
        // These two were missing entirely before, so whatever page/limit
        // the component passed in was silently dropped — every request
        // hit the exact same URL, so RTK Query (and the backend) kept
        // returning the same fixed batch of rows no matter which "page"
        // you clicked.
        if (params?.page) {
          queryParams.append("page", String(params.page));
        }
        if (params?.limit) {
          queryParams.append("limit", String(params.limit));
        }

        const queryString = queryParams.toString();
        return {
          url: `/store/all-store${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["sellerStore"],
    }),
    changeStoreStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/store/update-store-status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["sellerStore"],
    }),
    getAllSellerStores: builder.query({
      query: (params) => {
        const { page, limit, search, sortBy, storeFilter, status } =
          params ?? {};

        const queryParams = new URLSearchParams();

        if (page) queryParams.append("page", String(page));
        if (limit) queryParams.append("limit", String(limit));
        if (search) queryParams.append("search", search);
        if (sortBy) queryParams.append("sortBy", sortBy);
        if (storeFilter && storeFilter !== "all") {
          queryParams.append("storeFilter", storeFilter);
        }
        if (status && status !== "All") {
          queryParams.append("status", status);
        }

        const queryString = queryParams.toString();

        return {
          url: `/admin-dashboard/get-all-seller-list${
            queryString ? `?${queryString}` : ""
          }`,
          method: "GET",
        };
      },
      providesTags: ["sellerStore"],
    }),
  }),
});

export const {
  useGetStoreAllQuery,
  useChangeStoreStatusMutation,
  useGetAllSellerStoresQuery,
} = sellerStoreApi;
