"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Button, Drawer, Typography } from "antd";
import {
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useUser } from "@/utils/hooks/use-user";
import Logo from "@/components/ui/Logo/Logo";
import { NavMenu } from "@/components/ui/na/nav-menu";
import { menuItems } from "@/utils/config/menu-items";
import { UserNav } from "@/components/ui/na/user-nav";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // ── Redirect to login if not authenticated ───────────────────────────────
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, pathname, router]);

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // ── Page title helper ────────────────────────────────────────────────────
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    return (
      pathname
        .split("/")
        .pop()
        ?.replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()) || "Dashboard"
    );
  };

  // ── Sidebar content ──────────────────────────────────────────────────────
  const sidebarContent = (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="px-6 pt-4">
        <Logo />
      </div>
      <div className="flex-1 overflow-auto">
        <NavMenu
          items={menuItems}
          userRole={user.role}
          mode="inline"
          collapsed={sidebarCollapsed && !isMobile}
        />
      </div>
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          {(!sidebarCollapsed || isMobile) && (
            <Text type="secondary" className="text-sm">
              Logged in as{" "}
              <Text strong className="capitalize">
                {user.role}
              </Text>
            </Text>
          )}
          {!isMobile && (
            <Button
              type="text"
              icon={
                sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
              }
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Layout className="min-h-screen">
      {/* Mobile Sidebar */}
      {isMobile ? (
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setSidebarOpen(false)}
          open={sidebarOpen}
          width={280}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        /* Desktop Sidebar */
        <Sider
          trigger={null}
          collapsible
          collapsed={sidebarCollapsed}
          width={280}
          collapsedWidth={80}
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* Main Layout */}
      <Layout
        style={{ marginLeft: isMobile ? 0 : sidebarCollapsed ? 80 : 280 }}
      >
        {/* Header */}
        <Header className="px-4 bg-white border-b-[1px] border-gray-200 flex items-center justify-between">
          <div>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setSidebarOpen(true)}
              />
            )}
            <h3 className="p-0 leading-normal text-xl text-color-1c font-bold font-nun">
              {getPageTitle()}
            </h3>
            <p className="p-0 leading-normal text-sm text-color-60 font-nun">
              Welcome back, {user.name}
            </p>
          </div>
          <UserNav />
        </Header>

        {/* Page Content */}
        <Content style={{ margin: "16px", overflow: "auto" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
