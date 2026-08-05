import { DashboardLayout } from "@/components/pages/dashboard/DashboardLayout";
import type React from "react";
import { ConfigProvider } from "antd";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 6,
        },
        components: {
          Menu: {
            itemSelectedBg: "#1890ff",
            itemSelectedColor: "white",
            itemHeight: 40,
          },
        },
      }}
    >
      <DashboardLayout>{children}</DashboardLayout>
    </ConfigProvider>
  );
}
