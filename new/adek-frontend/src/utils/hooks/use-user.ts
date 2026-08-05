"use client";

import { useState, useEffect } from "react";
import type { User } from "@/types/user";
import { useAppSelector } from "@/redux/hooks";

export function useUser() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAppSelector((state) => state.auth.user);
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, [user]);

  const switchUserRole = (role: User["role"]) => {
    if (user) {
      setCurrentUser({ ...user, role });
    }
  };

  return {
    user: currentUser,
    isLoading,
    switchUserRole,
  };
}
