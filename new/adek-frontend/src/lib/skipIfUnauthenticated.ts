"use client";



import { useSelector } from "react-redux";
import { RootState }   from "@/redux/store"; // adjust path


// ─── Core selector ────────────────────────────────────────────────────────────

export const selectAccessToken = (state: RootState) => state.auth.access_token;
export const selectCurrentUser = (state: RootState) => state.auth.user;

// ─── Main hook ────────────────────────────────────────────────────────────────

/**
 * Returns helpers for guarding RTK Query hooks.
 *
 * `skip`        — pass as `{ skip }` to any RTK Query hook option
 * `token`       — the raw access token string (or null)
 * `user`        — the current user object (or null)
 * `isLoggedIn`  — true when a user + token are both present
 */
export function useAuth() {
  const token = useSelector(selectAccessToken);
  const user  = useSelector(selectCurrentUser);

  return {
    token,
    user,
    isLoggedIn: !!token && !!user,
    /** Pass this to any RTK Query hook: useGetXQuery(arg, { skip }) */
    skip: !token || !user,
  };
}

// ─── Convenience aliases ──────────────────────────────────────────────────────

/** Returns only the skip boolean — shortest import for simple cases. */
export function useSkip(): boolean {
  const token = useSelector(selectAccessToken);
  const user  = useSelector(selectCurrentUser);
  return !token || !user;
}