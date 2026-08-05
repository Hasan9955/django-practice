"use client";

import { Avatar, Dropdown, Tag, Button } from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useUser } from "@/utils/hooks/use-user";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutHandler } from "@/utils/handleLogout";

export function UserNav() {
  const { user } = useUser();
  const dispatch = useDispatch();
  const router = useRouter();
  const role = user?.role;

  console.log(user?.role, "user role in user nav");

  if (!user) return null;

  const getRoleTagColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "red";
      case "SELLER":
        return "blue";
      default:
        return "default";
    }
  };

  const handleMenuClick: MenuProps["onClick"] = async ({ key }) => {
    if (key === "logout") {
      await logoutHandler(dispatch, router);
    } else if (key === "profile") {
      if (role === "ADMIN") {
        router.push("/dashboard/admin/profile");
      } else if (role === "SELLER") {
        router.push("/dashboard/profile");
      } else {
        router.push("/dashboard/profile");
      }
    } else if (key === "billing") {
      if (role === "ADMIN") {
        router.push("/dashboard/admin/billing");
      } else if (role === "SELLER") {
        router.push("/dashboard/payment");
      } else {
        router.push("/dashboard/billing");
      }
    } else if (key === "settings") {
      router.push("/dashboard/profile");
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <div className="px-2 py-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">{user.name}</span>
            <Tag color={getRoleTagColor(user.role)} className="ml-2">
              {user.role.toUpperCase()}
            </Tag>
          </div>
          <div className="text-gray-500 text-sm">{user.email}</div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    { key: "profile", label: "Profile", icon: <UserOutlined /> },
    { key: "billing", label: "Billing", icon: <CreditCardOutlined /> },
    { key: "settings", label: "Settings", icon: <SettingOutlined /> },
    { type: "divider" },
    {
      key: "logout",
      label: "Log out",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <Dropdown
      menu={{ items, onClick: handleMenuClick }}
      placement="bottomRight"
      arrow
    >
      <Button type="text" className="h-auto p-1">
        <Avatar size={32} src={user.avatar} icon={<UserOutlined />} />
      </Button>
    </Dropdown>
  );
}
