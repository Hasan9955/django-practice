"use client";
import Image from "next/image";
import profileimg from "@/assets/images/profile/profile.png";
import { useGetMyProfileQuery } from "@/redux/features/auth/authApi";
import { Spin } from "antd";

const Sidebar = () => {
  const { data: profileData, isLoading: isLoadingProfile } =
    useGetMyProfileQuery({});
  const userData = profileData?.result || {};
  return (
    <div className="w-full">
      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#1C1C1C] font-nun font-bold">
        My Account
      </h2>
      <div className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 lg:px-6  border border-[#4b2121] text-center flex justify-center flex-col items-center rounded-lg md:rounded-[8px] mt-2 sm:mt-3 md:mt-4">
        <Image
          src={userData?.profileImage || profileimg}
          alt="Profile"
          width={80}
          height={80}
          className="w-10 h-10 md:w-14 md:h-14 lg:w-24 lg:h-24 rounded-full object-cover"
        />
        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl text-black font-nun font-semibold mt-3 mb-1">
          {isLoadingProfile ? <Spin /> : userData?.fullName || "User"}
        </h3>
      </div>
    </div>
  );
};

export default Sidebar;
