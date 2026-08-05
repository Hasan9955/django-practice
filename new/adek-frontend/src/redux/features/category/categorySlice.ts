import { baseApi } from "../../api/baseApi";

const categoryApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getAllCategory: builder.query({
			query: () => {
				return {
					url: `/category`,
					method: "GET",
				};
			},
			providesTags: ["category" , "platform"],
		}),
		getSingleCategory: builder.query({
			query: (id) => ({
				url: `category/${id}`,
				method: "GET",
			}),
			providesTags: ["category"],
		}),

		createCategory: builder.mutation({
			query: (data) => {
				return {
					url: "category",
					method: "POST",
					body: data,
				};
			},
			invalidatesTags: ["category"],
		}),

		updateCategory: builder.mutation({
			query: (data) => {
				return {
					url: `example/${data?.id}`,
					method: "POST",
					body: data?.formData,
				};
			},
			invalidatesTags: ["category"],
		}),
		deleteCategory: builder.mutation({
			query: (id) => {
				return {
					url: `example/${id}`,
					method: "DELETE",
				};
			},
			invalidatesTags: ["example"],
		}),
	}),
});

export const { useGetAllCategoryQuery } = categoryApi;
