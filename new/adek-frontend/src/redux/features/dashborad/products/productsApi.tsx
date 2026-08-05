
import { baseApi } from "../../../api/baseApi";

const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation({
      query: (formData) => ({
        url: "/product/create-product",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["product"],
    }),
    editProduct: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `/product/update-product/${productId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["product"],
    }),
    updateProductVariant: builder.mutation({
      query: ({ variantId, formData }) => ({
        url: `/product/update-varient/${variantId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["product"],
    }),
    updateProductBundleOffer: builder.mutation({
      query: ({ bundleOfferId, formData }) => ({
        url: `/product/update-bundle-offer/${bundleOfferId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["product"],
    }),
    updateB2BPackage: builder.mutation({
      query: ({ b2bPackageId, formData }) => ({
        url: `/product/update-b2b-package/${b2bPackageId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["product"],
    }),
    updateProductToggle: builder.mutation({
      query: ({ productId }) => ({
        url: `/product/update-product-toggle/${productId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["product"],
    }),
    getMyStoreProducts: builder.query({
      query: () => ({
        url: "/product/my-products",
        method: "GET",
      }),
      providesTags: ["product"],
    }),
    pushProductToStore: builder.mutation({
      query: (productId) => ({
        url: `/product/published-product/${productId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["product"],
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/product/delete-product/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["product", "sellerProfile"],
    }),
    getSingleProduct: builder.query({
      query: (productId) => ({
        url: `/product/single-product/${productId}`,
        method: "GET",
      }),
      providesTags: ["product"],
    }),
    getAllCoupons: builder.query({
      query: () => ({
        url: `/coupon/all-coupons`,
        method: "GET",
      }),
      providesTags: ["coupon"],
    }),
    getStoreCoupons: builder.query({
      query: (storeId) => ({
        url: `/coupon/my-coupons/${storeId}`,
        method: "GET",
      }),
      providesTags: ["coupon"],
    }),
    addBundleOffer: builder.mutation({
      query: ({ productId, data }) => ({
        url: `/product/create-bundle-offer/${productId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["product"],
    }),
    deleteBundleOffer: builder.mutation({
      query: (bundleOfferId) => ({
        url: `/product/delete-bundle-offer/${bundleOfferId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["product"],
    }),
    addB2BPackage: builder.mutation({
      query: ({ productId, data }) => ({
        url: `/product/create-b2b-package/${productId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["product"],
    }),
    deleteB2BPackage: builder.mutation({
      query: (b2bPackageId) => ({
        url: `/product/delete-b2b-package/${b2bPackageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["product"],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useGetMyStoreProductsQuery,
  usePushProductToStoreMutation,
  useDeleteProductMutation,
  useGetSingleProductQuery,
  useGetAllCouponsQuery,
  useGetStoreCouponsQuery,
  useEditProductMutation,
  useUpdateProductVariantMutation,
  useUpdateProductBundleOfferMutation,
  useUpdateB2BPackageMutation,
  useUpdateProductToggleMutation,
  useAddBundleOfferMutation,
  useDeleteBundleOfferMutation,
  useAddB2BPackageMutation,
  useDeleteB2BPackageMutation,
} = productsApi;
