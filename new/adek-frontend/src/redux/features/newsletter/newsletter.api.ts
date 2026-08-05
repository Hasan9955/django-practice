import { baseApi } from "../../api/baseApi";

const newsLetterManagementApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		addNewsLetter: builder.mutation({
			query: (data) => ({
				url: "/news/create-news-letter",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["newsletter", "user"],
		}),
	}),
});

export const { useAddNewsLetterMutation } = newsLetterManagementApi;
