/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * SessionSync.tsx
 *
 * Bridges NextAuth session → Redux store.
 * Place as the FIRST child of <ReduxStoreProvider> in layout.tsx.
 *
 * If you still see "Verify token needed" after adding this, check the
 * console — this component logs exactly what it finds in the session.
 */

import { useEffect, useRef } from "react";
import { useSession }        from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout }   from "@/redux/features/auth/authSlice"; // adjust path
import { RootState }         from "@/redux/store";                    // adjust path

export function SessionSync() {
  const { data: session, status } = useSession();
  const dispatch    = useDispatch();
  const reduxToken  = useSelector((s: RootState) => s.auth.access_token);
  const reduxUser   = useSelector((s: RootState) => s.auth.user);
  const lastSynced  = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (status === "loading") return;

    // ── Authenticated ────────────────────────────────────────────────────────
    if (status === "authenticated" && session) {

      // ⚠️  DEBUG — remove these logs once everything works
      console.group("[SessionSync] session received");
      console.log("status        :", status);
      console.log("session.user  :", session.user);
      console.log("access_token  :", (session as any).access_token  ?? "MISSING ← fix your jwt/session callbacks");
      console.log("refresh_token :", (session as any).refresh_token ?? "MISSING");
      console.groupEnd();

      const sessionToken   = (session as any).access_token   as string | undefined;
      const sessionRefresh = (session as any).refresh_token  as string | undefined;
      const sessionUser    = session.user;

      // Skip if nothing changed.
      if (lastSynced.current === sessionToken) return;
      lastSynced.current = sessionToken;

      if (sessionToken) {
        dispatch(
          setUser({
            user:          sessionUser ?? reduxUser,
            access_token:  sessionToken,
            refresh_token: sessionRefresh,
          })
        );
        console.log("[SessionSync] ✅ dispatched setUser with token");
      } else {
        // Session exists but has no backend token.
        // This means jwt() / session() callbacks don't expose access_token.
        // See the REQUIRED CALLBACKS section below.
        console.error(
          "[SessionSync] ❌ session.access_token is missing.\n" +
          "Your NextAuth jwt() and session() callbacks must expose the backend token.\n" +
          "Copy the callbacks from the comment below into your [...nextauth] route."
        );
      }
    }

    // ── Unauthenticated ───────────────────────────────────────────────────────
    if (status === "unauthenticated") {
      if (reduxUser || reduxToken) {
        lastSynced.current = null;
        dispatch(logout());
        console.log("[SessionSync] session gone → dispatched logout");
      }
    }
  }, [status, session, dispatch, reduxToken, reduxUser]);

  return null;
}

/*
 * ─── REQUIRED NEXTAUTH CALLBACKS ─────────────────────────────────────────────
 *
 * If the console shows "access_token is MISSING", add / fix these callbacks
 * in your  app/api/auth/[...nextauth]/route.ts  (or pages/api/auth/[...nextauth].ts).
 *
 * The exact field names on `user` depend on what your backend login endpoint
 * returns.  Common names: user.token, user.access_token, user.accessToken.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   callbacks: {
 *     async jwt({ token, user }) {
 *       // `user` is only present on the first sign-in call.
 *       if (user) {
 *         token.access_token  = user.access_token;   // ← match your backend field
 *         token.refresh_token = user.refresh_token;
 *         token.user          = user;
 *       }
 *       return token;
 *     },
 *
 *     async session({ session, token }) {
 *       session.access_token  = token.access_token  as string;
 *       session.refresh_token = token.refresh_token as string;
 *       session.user          = token.user          as any;
 *       return session;
 *     },
 *   },
 *
 * Also extend the NextAuth types so TypeScript is happy:
 *
 *   // types/next-auth.d.ts
 *   import "next-auth";
 *   declare module "next-auth" {
 *     interface Session {
 *       access_token?:  string;
 *       refresh_token?: string;
 *     }
 *   }
 *   declare module "next-auth/jwt" {
 *     interface JWT {
 *       access_token?:  string;
 *       refresh_token?: string;
 *       user?:          any;
 *     }
 *   }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */