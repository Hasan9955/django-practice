import { baseApi } from "../../api/baseApi";

const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query({
      query: () => ({
        url: `/banner/get-all-banners`,
        method: "GET",
      }),
      providesTags: ["banner", "platform"],
    }),
    getPlatformDataForUserSupport: builder.query({
      query: () => ({
        url: `/admin/get-platform-data-for-user`,
        method: "GET",
      }),
      providesTags: ["user"],
    }),
    getCmsContent: builder.query({
      query: () => ({
        url: `/faq-policy/get-cms-content`,
        method: "GET",
      }),
      providesTags: ["banner"],
    }),

    // promotion
    createPromotion: builder.mutation({
      query: (data) => ({
        url: `/promotion/create-promotion`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["promotion"],
    }),
    getAllPromotions: builder.query({
      query: () => ({
        url: `/promotion/get-all-promotions`,
        method: "GET",
      }),
      providesTags: ["promotion"],
    }),
    getPromotionById: builder.query({
      query: (promotionId) => ({
        url: `/promotion/get-single-promotion/${promotionId}`,
        method: "GET",
      }),
      providesTags: ["promotion"],
    }),
    deletePromotion: builder.mutation({
      query: (promotionId) => ({
        url: `/promotion/delete-promotion/${promotionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["promotion"],
    }),
    updatePromotion: builder.mutation({
      query: ({ promotionId, data }) => ({
        url: `/promotion/update-promotion/${promotionId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["promotion"],
    }),
  }),
});

export const {
  useGetBannersQuery,
  useGetPlatformDataForUserSupportQuery,
  useGetCmsContentQuery,
  useGetAllPromotionsQuery,
  useDeletePromotionMutation,
  useUpdatePromotionMutation,
  useCreatePromotionMutation,
  useGetPromotionByIdQuery,
} = bannerApi;
export { bannerApi };
