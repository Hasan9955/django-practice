import { baseApi } from "../../api/baseApi";

const logoApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getAllLogos: builder.query({
			query: () => ({
				url: "/logo/get-all-logos",
				method: "GET",
			}),
			providesTags: ["logo"],
		}),
		getSingleLogo: builder.query({
			query: (id) => ({
				url: `logo/${id}`,
				method: "GET",
			}),
			providesTags: ["logo"],
		}),

		createLogo: builder.mutation({
			query: (data) => {
				return {
					url: "/logo/create-logo",
					method: "POST",
					body: data,
				};
			},
			invalidatesTags: ["logo"],
		}),

		updateLogo: builder.mutation({
			query: (data) => {
				return {
					url: `/logo/update-logo/${data?.id}`,
					method: "POST",
					body: data?.formData,
				};
			},
			invalidatesTags: ["logo"],
		}),
		deleteLogo: builder.mutation({
			query: (id) => {
				return {
					url: `/logo/delete-logo/${id}`,
					method: "DELETE",
				};
			},
			invalidatesTags: ["logo"],
		}),
		imageUpload: builder.mutation({
			query: (formData) => ({
				url: "/chat/chat-image-upload",
				method: "POST",
				body: formData,
			}),
		}),
	}),
});

export const {
    useGetAllLogosQuery,
	useGetSingleLogoQuery,
	useCreateLogoMutation,
	useUpdateLogoMutation,
	useDeleteLogoMutation,
	useImageUploadMutation,
} = logoApi;
