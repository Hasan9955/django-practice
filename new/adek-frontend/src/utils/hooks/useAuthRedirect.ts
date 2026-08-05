"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/skipIfUnauthenticated";

export function useAuthRedirect() {
  const { skip } = useAuth();
  const router   = useRouter();

  useEffect(() => {
    if (skip) {
      router.push("/auth/login");
    }
  }, [skip, router]);

  return { skip };
}