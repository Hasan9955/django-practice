/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";

declare module "next-auth" {
  interface User {
    backendTokens?: any;
  }

  interface Session {
    backendTokens?: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendTokens?: any;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.NEXT_PUBLIC_FACEBOOK_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_FACEBOOK_SECRET as string,
    }),
    AppleProvider({
      clientId: process.env.NEXT_PUBLIC_APPLE_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_APPLE_SECRET as string,
    }),
  ],

  secret: process.env.NEXT_PUBLIC_NEXT_AUTH_SECRET,

  debug: process.env.NODE_ENV === "development",

  callbacks: {
    async signIn({ user, account }) {
      try {
        const socialLoginType = account?.provider?.toUpperCase();

        const payload = {
          fullName: user.name,
          email: user.email,
          socialLoginType,
        };

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/social-login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          console.error("Social login API failed", await res.text());
          return false;
        }

        const data = await res.json();
        user.backendTokens = data;

        return true;
      } catch (err) {
        console.error("Error during social login:", err);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user?.backendTokens) {
        token.backendTokens = user.backendTokens;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.backendTokens) {
        session.backendTokens = token.backendTokens;
      }
      return session;
    },
  },
};
// ```

// ---

// ## 🔐 **OAuth Provider Configuration:**

// ### **1. Google OAuth Console:**
// Go to: https://console.cloud.google.com/apis/credentials

// **Add these Authorized redirect URIs:**
// ```
// https://burliest-multiply-tanisha.ngrok-free.dev/api/auth/callback/google
// http://localhost:3000/api/auth/callback/google
// ```

// **OAuth Consent Screen:**
// - Make sure app status is correct (Testing or Production)
// - Add test users if in Testing mode
// - Add required scopes: email, profile

// ---

// ### **2. Facebook Developer Console:**
// Go to: https://developers.facebook.com/apps/

// **Navigate to: Facebook Login → Settings**

// **Add Valid OAuth Redirect URIs:**
// ```
// https://burliest-multiply-tanisha.ngrok-free.dev/api/auth/callback/facebook
// http://localhost:3000/api/auth/callback/facebook
// ```

// **Navigate to: Settings → Basic**

// **Add App Domains:**
// ```
// burliest-multiply-tanisha.ngrok-free.dev
// localhost
// ```

// **Make sure these are enabled:**
// - ✅ Client OAuth Login: ON
// - ✅ Web OAuth Login: ON

// ---

// ### **3. Apple Developer Console (if using):**
// Go to: https://developer.apple.com/account/resources/identifiers/list/serviceId

// **Add Return URLs:**
// ```
// https://burliest-multiply-tanisha.ngrok-free.dev/api/auth/callback/apple
// http://localhost:3000/api/auth/callback/apple
