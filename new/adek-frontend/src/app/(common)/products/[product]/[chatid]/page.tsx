"use client";
import ChatInterface from "@/components/pages/chat/Chat";
import { useGetOtherProfileQuery } from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const Page = () => {
  const path = usePathname();
  const pathSegments = path.split("/");
  const id = pathSegments[pathSegments.length - 1];
  const router = useRouter();
  const { data } = useGetOtherProfileQuery(id);
  const token = useAppSelector((state: RootState) => state.auth.access_token);
  console.log(data, "no data");
  return (
    <ChatInterface
      contactName={data?.result?.fullName || "Seller"}
      contactAvatar={data?.result?.profileImage || "/image.jpg"}
      isOnline={true}
      onClose={() => router.back()}
      token={token || ""}
    />
  );
};

export default Page;
