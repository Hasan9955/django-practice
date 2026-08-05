"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Badge } from "antd";
import { useState } from "react";
import type { MenuProps } from "antd";
import type { MenuItem, UserRole } from "@/types/user";

interface NavMenuProps {
  items: MenuItem[];
  userRole: UserRole;
  collapsed?: boolean;
  mode?: "inline" | "vertical";
  theme?: "light" | "dark";
}

export function NavMenu({
  items,
  userRole,
  collapsed = false,
  mode = "inline",
  theme = "light",
}: NavMenuProps) {
  const pathname = usePathname();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const filterItemsByRole = (items: MenuItem[]): MenuItem[] => {
    return items.filter((item) => {
      if (!item.roles.includes(userRole)) return false;
      if (item.children) {
        item.children = filterItemsByRole(item.children);
      }
      return true;
    });
  };

  const convertToAntdMenuItems = (items: MenuItem[]): MenuProps["items"] => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;

      if (hasChildren) {
        return {
          key: item.key,
          icon: item.icon,
          label: (
            <span>
              {item.label}
              {item.badge && (
                <Badge
                  count={item.badge}
                  size="small"
                  style={{ marginLeft: 8 }}
                />
              )}
            </span>
          ),
          children: convertToAntdMenuItems(item.children!),
        };
      }

      return {
        key: item.key,
        icon: item.icon,
        label: (
          <Link href={item.href}>
            <span>
              {item.label}
              {item.badge && (
                <Badge
                  count={item.badge}
                  size="small"
                  style={{ marginLeft: 8 }}
                />
              )}
            </span>
          </Link>
        ),
      };
    });
  };

  const filteredItems = filterItemsByRole(items);
  const menuItems = convertToAntdMenuItems(filteredItems);

  // Get selected keys based on current pathname
  const getSelectedKeys = () => {
    const sortedItems = [...filteredItems].sort(
      (a, b) => b.href.length - a.href.length,
    );
    const selectedItem = sortedItems.find((item) => isActive(item.href));
    return selectedItem ? [selectedItem.key] : [];
  };

  // Handle open/close of submenus, ensuring only one submenu is open
  const onOpenChange = (keys: string[]) => {
    if (keys.length === 0) {
      setOpenKeys([]);
    } else {
      setOpenKeys([keys[keys.length - 1]]); // Keep only the last clicked submenu open
    }
  };

  return (
    <Menu
      mode={mode}
      theme={theme}
      selectedKeys={getSelectedKeys()}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      items={menuItems}
      inlineCollapsed={collapsed}
      style={{ border: "none" }}
      className="custom-menu"
      //   inlineIndent={6}
    />
  );
}
