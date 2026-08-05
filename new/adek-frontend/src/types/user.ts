import type React from "react";
export type UserRole = "ADMIN" | "SELLER" | "ALL";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  roles: UserRole[];
  children?: MenuItem[];
  badge?: string | number;
}
