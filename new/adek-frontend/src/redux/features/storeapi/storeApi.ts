import { baseApi } from "../../api/baseApi";
export interface ApiProduct {
  id: string;
  productName: string;
  basePrice: number;
  discountPrice: number;
  avgRating: number;
  totalSale: number;
  productStatus: "NewArrival" | "InStock" | "OutOfStock" | string;
  productPhoto: string[];
  category: { id: string; name: string } | null;
}

export interface ProductMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetStoreProductsResponse {
  result: {
    products: ApiProduct[];
    meta: ProductMeta;
  };
}

export interface GetStoreProductsArgs {
  storeId: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  topSelling?: boolean;
  categoryId?: string | null;
  /** Comma-separated sizes e.g. "S,M,L" — send only if your backend supports it */
  sizes?: string;
  /** Comma-separated colors e.g. "#000000,#FF6B35" — send only if your backend supports it */
  colors?: string;
  sortBy?:
    | "price-low-high"
    | "price-high-low"
    | "newest"
    | "top-selling"
    | "default";
}

const storeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query({
      query: ({ limit, search, page }) => ({
        url: `/popular/most-popular-stores`,
        method: "GET",
        params: { limit, search, page },
      }),
      providesTags: ["stores"],
    }),
    getProductStoreId: builder.query<
      GetStoreProductsResponse,
      GetStoreProductsArgs
    >({
      query: ({
        storeId,
        page = 1,
        limit = 12,
        minPrice,
        maxPrice,
        topSelling,
        categoryId,
        sizes,
        colors,
        sortBy,
      }) => {
        // Strip undefined/null so they aren't serialised as "undefined" strings
        const params: Record<string, string | number | boolean> = {
          page,
          limit,
        };
        if (minPrice !== undefined) params.minPrice = minPrice;
        if (maxPrice !== undefined) params.maxPrice = maxPrice;
        if (topSelling !== undefined) params.topSelling = topSelling;
        if (categoryId) params.categoryId = categoryId;
        if (sizes) params.sizes = sizes;
        if (colors) params.colors = colors;
        if (sortBy && sortBy !== "default") params.sortBy = sortBy;

        return {
          url: `/product/get-store-products/${storeId}`,
          method: "GET",
          params,
        };
      },
      // Keep previous data while new page loads (no content flash)
      keepUnusedDataFor: 60,
      providesTags: (_result, _err, { storeId }) => [
        { type: "stores", id: storeId },
      ],
    }),
    subscribeStore: builder.mutation({
      query: (data) => ({
        url: `/store/subscribe-store`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["stores"],
    }),
    userStore: builder.query({
      query: (storeId) => ({
        url: `/store/user-store/${storeId}`,
        method: "GET",
      }),
      providesTags: ["stores"],
    }),
  }),
});

export const {
  useGetStoresQuery,
  useGetProductStoreIdQuery,
  useSubscribeStoreMutation,
  useUserStoreQuery,
} = storeApi;
