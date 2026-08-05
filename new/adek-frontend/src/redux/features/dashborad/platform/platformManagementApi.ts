import { baseApi } from "../../../api/baseApi";

export type GetSellerSubscriptionsParams = {
  search?: string;
  storeId?: string;
  status?: "ACTIVE" | "PENDING" | "DEACTIVE" | "FAILED";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

const newsLetterManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updatePlatform: builder.mutation({
      query: (formData) => ({
        url: "/admin/update-platform",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["platform"],
    }),
    createOrUpdateFaq: builder.mutation({
      query: (formData) => ({
        url: "/faq-policy/upsert-faq-policy",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["platform"],
    }),
    deleteFaq: builder.mutation({
      query: (faqId) => ({
        url: `/faq-policy/delete-faq/${faqId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["platform"],
    }),
    getPlatformData: builder.query({
      query: () => ({
        url: "/admin/get-platfrom-data",
        method: "GET",
      }),
      providesTags: ["platform"],
    }),
    getMySubscription: builder.query({
      query: () => ({
        url: "/subscriptions/get-my-subscription",
        method: "GET",
      }),
      providesTags: ["platform"],
    }),
    getSellerSubscritionPlans: builder.query({
      query: ({ filter }) => ({
        url: "/subscriptions/get-all-subscription",
        method: "GET",
        params: { filter },
      }),
      providesTags: ["platform"],
    }),

    // getAllSubscribedsellersrition: builder.query({
    //   query: (params: GetSellerSubscriptionsParams) => {
    //     const { search, storeId, status, startDate, endDate } = params;
    //     return {
    //       url: "/admin-dashboard/get-all-subscribedseller",
    //       method: "GET",
    //       params: {
    //         ...(search ? { search } : {}),
    //         ...(storeId ? { storeId } : {}),
    //         ...(status ? { status } : {}),
    //         ...(startDate ? { startDate } : {}),
    //         ...(endDate ? { endDate } : {}),
    //       },
    //     };
    //   },
    //   providesTags: ["platform"],
    // }),

    getAllSubscribedsellersrition: builder.query({
      query: (params: GetSellerSubscriptionsParams = {}) => {
        const { status, startDate, endDate } = params;

        const cleanParams: Record<string, string> = {};
        if (status) cleanParams.status = status;
        if (startDate) cleanParams.startDate = startDate;
        if (endDate) cleanParams.endDate = endDate;

        return {
          // ✅ exact path + spelling from Postman
          url: "/admin-dashboard/get-all-subscribedsellers",
          method: "GET",
          params: cleanParams,
        };
      },
      providesTags: ["platform"],
    }),
    getAdminDashboard: builder.query({
      query: (region) => ({
        url: "/admin-dashboard/seals-insight-by-region",
        method: "GET",
        params: { region },
      }),
      providesTags: ["platform"],
    }),
    editCategory: builder.mutation({
      query: ({ id, formdata }) => ({
        url: `/admin/update-single-cateogory/${id}`,
        method: "PATCH",
        body: formdata,
      }),
      invalidatesTags: ["platform"],
    }),
    deleteCategoryAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin/delete-single-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["platform"],
    }),

    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/banner/delete-banner/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["platform"],
    }),
    editBanner: builder.mutation({
      query: ({ id, formdata }) => ({
        url: `/banner/update-banner/${id}`,
        method: "PATCH",
        body: formdata,
      }),
      invalidatesTags: ["platform"],
    }),
    updateFooter: builder.mutation({
      query: (formData) => ({
        url: "/faq-policy/upsert-faq-policy",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["platform"],
    }),
  }),
});

export const {
  useUpdatePlatformMutation,
  useGetMySubscriptionQuery,
  useGetPlatformDataQuery,
  useCreateOrUpdateFaqMutation,
  useGetSellerSubscritionPlansQuery,
  useDeleteFaqMutation,
  useGetAdminDashboardQuery,
  useEditCategoryMutation,
  useDeleteCategoryAdminMutation,
  useDeleteBannerMutation,
  useEditBannerMutation,
  useUpdateFooterMutation,
  useGetAllSubscribedsellersritionQuery,
} = newsLetterManagementApi;
