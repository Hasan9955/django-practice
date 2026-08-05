import {
  GetMyProductOrdersParams,
  ProductOrdersApiResponse,
} from "@/components/pages/dashboard/adminDashboard/orders&payments/OdersSellersList";
import { baseApi } from "../../api/baseApi";

const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllProduct: builder.query({
      query: ({ search, categoryId }) => ({
        url: `/product/all-products`,
        method: "GET",
        params: { search, categoryId },
      }),
      providesTags: ["product"],
    }),
    getMostPopularProducts: builder.query({
      query: () => ({
        url: `/popular/most-popular-products`,
        method: "GET",
      }),
      providesTags: ["product"],
    }),
    getProductById: builder.query({
      query: (productId) => ({
        url: `/product/single-product/${productId}`,
        method: "GET",
      }),
      providesTags: ["product"],
    }),
    addToCartProduct: builder.mutation({
      query: (data) => ({
        url: `/carts/add-to-cart`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["product"],
    }),
    getAllCart: builder.query({
      query: () => ({
        url: `/carts/my-cart`,
        method: "GET",
      }),
      providesTags: ["product"],
    }),
    removeFromCart: builder.mutation({
      query: (data) => ({
        url: `/carts/remove-selected-product`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["product"],
    }),
    applyCoupon: builder.mutation({
      query: (data) => ({
        url: `/coupon/apply-coupon`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["product"],
    }),
    // getMyProductOrders: builder.query({
    //   query: (userId) => ({
    //     url: `/payment/my-store-orders/${userId}`,
    //     method: "GET",
    //   }),
    //   providesTags: ["product"],
    // }),
    // getMyProductOrders: builder.query<
    //   ProductOrdersApiResponse,
    //   GetMyProductOrdersParams
    // >({
    //   query: ({
    //     userId,
    //     page,
    //     limit,
    //     searchTerm,
    //     orderStatus,
    //     sortByDate,
    //     fromDate,
    //     toDate,
    //   }) => {
    //     const params = new URLSearchParams();

    //     if (page) params.set("page", String(page));
    //     if (limit) params.set("limit", String(limit));
    //     if (searchTerm) params.set("searchTerm", searchTerm);
    //     if (orderStatus) params.set("orderStatus", orderStatus);
    //     if (sortByDate) params.set("sortByDate", sortByDate);
    //     if (fromDate) params.set("fromDate", fromDate);
    //     if (toDate) params.set("toDate", toDate);

    //     const qs = params.toString();

    //     return {
    //       url: `/payment/my-store-orders/${userId}${qs ? `?${qs}` : ""}`,
    //       method: "GET",
    //     };
    //   },
    //   providesTags: ["product"],
    // }),

    getMyProductOrders: builder.query<
      ProductOrdersApiResponse,
      GetMyProductOrdersParams
    >({
      query: ({
        userId,
        page,
        limit,
        searchTerm,
        orderStatus,
        sortByDate,
        fromDate,
        toDate,
      }) => {
        const params = new URLSearchParams();

        if (page) params.set("page", String(page));
        if (limit) params.set("limit", String(limit));
        if (searchTerm) params.set("searchTerm", searchTerm);
        if (orderStatus) params.set("orderStatus", orderStatus);
        if (sortByDate) params.set("sortByDate", sortByDate);
        if (fromDate) params.set("fromDate", fromDate);
        if (toDate) params.set("toDate", toDate);

        const qs = params.toString();

        return {
          url: `/payment/my-store-orders/${userId}${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      // Give each order a distinct tag too, so a mutation that changes
      // one specific order (e.g. accept/cancel) can invalidate just that
      // order instead of refetching the whole list unnecessarily.
      providesTags: (result) =>
        result?.result?.data
          ? [
              ...result.result.data.map((order) => ({
                type: "product" as const,
                id: order.id,
              })),
              { type: "product" as const, id: "LIST" },
            ]
          : [{ type: "product" as const, id: "LIST" }],
    }),
    getAllb2bProduct: builder.query({
      query: (search) => ({
        url: `/b2b-portal/get-all-b2b-packages`,
        method: "GET",
        params: { search },
      }),
      providesTags: ["product"],
    }),
    addProductReview: builder.mutation({
      query: ({ orderId, data }) => ({
        url: `/reviews/create-review/${orderId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["product"],
    }),
  }),
});

export const {
  useGetAllProductQuery,
  useAddToCartProductMutation,
  useGetProductByIdQuery,
  useGetAllCartQuery,
  useRemoveFromCartMutation,
  useApplyCouponMutation,
  useGetMostPopularProductsQuery,
  useGetMyProductOrdersQuery,
  useGetAllb2bProductQuery,
  useAddProductReviewMutation,
} = productApi;
