import { baseApi } from "../../api/baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (userInfo) => {
        return {
          url: "/auth/login",
          method: "POST",
          body: userInfo,
        };
      },
      invalidatesTags: ["user"],
    }),
    verifyOtp: builder.mutation({
      query: (otpInfo) => ({
        url: "/auth/verfiy-otp",
        method: "POST",
        body: otpInfo,
      }),
      invalidatesTags: ["user"],
    }),
    sendOtp: builder.mutation({
      query: (userInfo) => {
        return {
          url: "/auth/resend-otp",
          method: "POST",
          body: userInfo,
        };
      },
      invalidatesTags: ["user"],
    }),

    loginWithSocial: builder.mutation({
      query: (userInfo) => {
        console.log({ userInfo });
        return {
          url: "/auth/social-login",
          method: "POST",
          body: userInfo,
        };
      },
      invalidatesTags: ["user"],
    }),
    forgotPassword: builder.mutation({
      query: (userInfo) => {
        return {
          url: "/auth/forgetpassword-otp-to-gmail",
          method: "POST",
          body: userInfo,
        };
      },
      invalidatesTags: ["user"],
    }),
    resetPassword: builder.mutation({
      query: (userInfo) => {
        return {
          url: "/auth/reset-password",
          method: "PATCH",
          body: userInfo,
        };
      },
      invalidatesTags: ["user"],
    }),
    updateUser: builder.mutation({
      query: (userInfo) => {
        return {
          url: "user/me",
          method: "PATCH",
          body: userInfo,
        };
      },
      invalidatesTags: ["user"],
    }),
    register: builder.mutation({
      query: (userInfo) => {
        return {
          url: "/user/create",
          method: "POST",
          body: userInfo,
        };
      },
    }),
    otp: builder.mutation({
      query: (userInfo) => {
        return {
          url: "users/verify-otp",
          method: "POST",
          body: userInfo,
        };
      },
    }),
    getMyProfile: builder.query({
      query: () => ({
        url: "/user/get-profile",
        method: "GET",
      }),
      providesTags: ["user", "admin"],
    }),
    updateUserProfile: builder.mutation({
      query: (formData) => ({
        url: "/user/update-profile",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["user"],
    }),
    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: "/admin/admin-login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["admin"],
    }),
    updatePassword: builder.mutation({
      query: (passwordInfo) => ({
        url: "/auth/change-password",
        method: "POST",
        body: passwordInfo,
      }),
      invalidatesTags: ["user"],
    }),
    getOtherProfile: builder.query({
      query: (userId) => ({
        url: `/user/get-other-user-profile/${userId}`,
        method: "GET",
      }),
      providesTags: ["user"],
    }),
    getAllUser: builder.query({
      query: ({ search, page, limit, role }) => ({
        url: "/user/get-all-users",
        method: "GET",
        params: { search, page, limit, role },
      }),
      providesTags: ["user"],
    }),

    userDelete: builder.mutation({
      query: (id) => ({
        url: `/user/delete-user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["user"],
    }),
  }),
});

export const {
  useLoginMutation,
  useAdminLoginMutation,
  useLoginWithSocialMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRegisterMutation,
  useUpdateUserMutation,
  useOtpMutation,
  useGetMyProfileQuery,
  useVerifyOtpMutation,
  useSendOtpMutation,
  useUpdateUserProfileMutation,
  useUpdatePasswordMutation,
  useGetOtherProfileQuery,
  useGetAllUserQuery,
  useUserDeleteMutation,
} = authApi;
