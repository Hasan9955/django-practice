/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { logout, setUser } from "../features/auth/authSlice";
import { signOut } from "next-auth/react";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.access_token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("accept", "application/json");
    return headers;
  },
});

let refreshPromise: Promise<boolean> | null = null;
let isHandlingExpiry = false;

function buildUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  // window.location.href = "/auth/login";
}

async function attemptTokenRefresh(
  refreshToken: string,
  user: any,
  api: any
): Promise<boolean> {
  try {
    const res = await fetch(buildUrl("/refresh-token"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${refreshToken}`,
      },
    });

    const data = await res.json();

    if (data?.success) {
      api.dispatch(
        setUser({
          user,
          access_token:  data.data.token ?? data.data.access_token,
          refresh_token: data.data.refresh_token ?? refreshToken,
        })
      );
      return true;
    }
    return false;
  } catch (err) {
    console.error("[baseApi] refresh error:", err);
    return false;
  }
}

async function handleExpiredSession(api: any): Promise<void> {
  if (isHandlingExpiry) return;
  isHandlingExpiry = true;

  try {
    api.dispatch(logout());
    await signOut({ redirect: false });
    redirectToLogin();
  } catch (err) {
    console.error("[baseApi] expiry handler error:", err);
    redirectToLogin();
  } finally {
    isHandlingExpiry = false;
  }
}

const baseQueryWithRefreshToken: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions: Record<string, unknown>) => {
  const state        = api.getState() as RootState;
  const user         = state.auth.user;
  const accessToken  = state.auth.access_token;
  const refreshToken = state.auth.refresh_token;

  if (user && refreshToken && !accessToken) {
    if (!refreshPromise) {
      refreshPromise = attemptTokenRefresh(refreshToken, user, api).finally(
        () => { refreshPromise = null; }
      );
    }

    const refreshed = await refreshPromise;

    if (!refreshed) {
      await handleExpiredSession(api);
      return {
        error: {
          status: 401,
          data: { message: "Session expired" },
        } as FetchBaseQueryError,
      };
    }
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const freshState        = api.getState() as RootState;
    const freshUser         = freshState.auth.user;
    const freshRefreshToken = freshState.auth.refresh_token;

    if (!freshUser || !freshRefreshToken) {
      await handleExpiredSession(api);
      return {
        error: {
          status: 401,
          data: { message: "Session expired" },
        } as FetchBaseQueryError,
      };
    }

    if (!refreshPromise) {
      refreshPromise = attemptTokenRefresh(
        freshRefreshToken,
        freshUser,
        api
      ).finally(() => { refreshPromise = null; });
    }

    const refreshed = await refreshPromise;

    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);

      if (result.error?.status === 401) {
        await handleExpiredSession(api);
        return {
          error: {
            status: 401,
            data: { message: "Session expired" },
          } as FetchBaseQueryError,
        };
      }
    } else {
      await handleExpiredSession(api);
      return {
        error: {
          status: 401,
          data: { message: "Session expired" },
        } as FetchBaseQueryError,
      };
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: [
    "user", "example", "newsletter", "category", "banner", "logo",
    "admin", "product", "order", "cart", "platform", "sellerStore",
    "products", "marketPlace", "sellerProfile", "sellerDashboard",
    "nicheHub", "payment", "messages", "stores", "tickets", "refunds",
    "coupon", "b2bPackages", "b2bConversations", "promotion",
  ],
  endpoints: () => ({}),
});