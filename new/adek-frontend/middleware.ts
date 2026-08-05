/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ─── Route Definitions ────────────────────────────────────────────────────────

/**
 * Routes that redirect to home if already authenticated
 */
const AUTH_ROUTES = [
  "/auth/login",
  "/auth/forgot-password",
  "/auth/resetpassword",
];

/**
 * USER + SELLER + ADMIN — any authenticated user
 * src/app/(common)/...
 */
const PROTECTED_USER_ROUTES = [
  "/account",
  "/cart",
  "/checkout",
  "/payment",
  "/account/B2B-portal",
  "/account/contact-seller",
  "/account/my-orders",
];

/**
 * SELLER + ADMIN only
 * src/app/(dashboard)/dashboard/ (non-admin sections)
 */
const SELLER_ROUTES = [
  "/dashboard/all-product",
  "/dashboard/add-product",
  "/dashboard/edit-product",
  "/dashboard/b2bportal",
  "/dashboard/messages",
  "/dashboard/nichehub",
  "/dashboard/notifications",
  "/dashboard/order-list",
  "/dashboard/payment",
  "/dashboard/profile",
  "/dashboard/promotion-discount",
  "/dashboard/returns-disput",
  "/dashboard/reviews",
  "/dashboard/sellapypro",
  "/dashboard/shipping-setting",
  "/dashboard/success",
  "/dashboard/test",
  "/dashboard/products",
];

/**
 * ADMIN only
 * src/app/(dashboard)/dashboard/(admin)/...
 */
const ADMIN_ROUTES = [
  "/dashboard/analytics&insights",
  "/dashboard/monetization&promotions",
  "/dashboard/orders&payments",
  "/dashboard/platform-management",
  "/dashboard/seller&store-oversight",
  "/dashboard/user-support-control",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "USER" | "SELLER" | "ADMIN";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function getDefaultRedirect(role: Role): string {
  if (role === "ADMIN") return "/dashboard/analytics&insights";
  if (role === "SELLER") return "/dashboard/profile";
  return "/";
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals, NextAuth API, and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|css|js|map)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Decode session token
  // Reads from the NextAuth JWT cookie automatically
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // ⚠️  Adjust this to match YOUR JWT payload shape:
  //  - token?.role           (flat)
  //  - token?.user?.role     (nested under user)
  //  - token?.data?.role     (nested under data)
  const userRole = (token?.role ?? (token?.user as any)?.role ?? null) as Role | null;

  // ── 1. Auth routes ───────────────────────────────────────────────────────
  // If already logged in, redirect away from login/register pages
  if (matchesRoute(pathname, AUTH_ROUTES)) {
    if (isAuthenticated && userRole) {
      return NextResponse.redirect(
        new URL(getDefaultRedirect(userRole), request.url)
      );
    }
    return NextResponse.next();
  }

  // ── 2. Admin-only routes ─────────────────────────────────────────────────
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(
          `/auth/login?callbackUrl=${encodeURIComponent(pathname)}`,
          request.url
        )
      );
    }
    if (userRole !== "ADMIN") {
      // Seller → their dashboard, User → home
      return NextResponse.redirect(
        new URL(userRole === "SELLER" ? "/dashboard/profile" : "/", request.url)
      );
    }
    return NextResponse.next();
  }

  // ── 3. Seller + Admin routes ─────────────────────────────────────────────
  if (matchesRoute(pathname, SELLER_ROUTES)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(
          `/auth/login?callbackUrl=${encodeURIComponent(pathname)}`,
          request.url
        )
      );
    }
    if (userRole !== "SELLER" && userRole !== "ADMIN") {
      // Plain USER has no access to seller dashboard
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── 4. User routes (any authenticated role) ──────────────────────────────
  if (matchesRoute(pathname, PROTECTED_USER_ROUTES)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(
          `/auth/login?callbackUrl=${encodeURIComponent(pathname)}`,
          request.url
        )
      );
    }
    // USER, SELLER, ADMIN — all fine
    return NextResponse.next();
  }

  // ── 5. Everything else is public ─────────────────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};