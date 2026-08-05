"use client";

import type React from "react";
import { Package, MessageCircle, Star, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface SideNavbarProps {
  activeItem: string;
  onItemClick: (itemId: string) => void;
}

const SideNavbar: React.FC<SideNavbarProps> = ({ activeItem, onItemClick }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const navItems: NavItem[] = [
    {
      id: "my-orders",
      label: "My Orders",
      icon: <Package className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />,
      href: "/account/my-orders",
    },
    {
      id: "contact-seller",
      label: "Contact Seller",
      icon: <MessageCircle className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />,
      href: "/account/contact-seller",
    },
    {
      id: "B2B-portal",
      label: "B2B Portal",
      icon: <Star className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />,
      href: "/account/B2B-portal",
    },
  ];

  const handleItemClick = (item: NavItem) => {
    onItemClick(item.id);
    router.push(item.href);
  };

  const handleSignOut = () => {
    dispatch(logout());
    toast.success("Signing out...");
    setTimeout(() => {
      router.push("/auth/login");
    }, 1000);
  };

  const isActive = (item: NavItem) =>
    activeItem === item.id || pathname === item.href || pathname === `${item.href}/messages`;

  return (
    <div className="w-full mt-2 sm:mt-3 md:mt-4 lg:mt-4 xl:mt-5">
      <div
        className="
          bg-white border border-gray-200 rounded-xl shadow-sm
          p-1.5 sm:p-2 md:p-3 lg:p-3 xl:p-4
          flex flex-row lg:flex-col
          gap-1 sm:gap-1.5 md:gap-2 lg:gap-0
        "
      >
        <div
          className="
            flex flex-row lg:flex-col
            gap-1 sm:gap-1.5 md:gap-2 lg:gap-2 xl:gap-2.5
            flex-1 lg:flex-none
          "
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`
                w-full flex items-center text-start
                transition-all duration-200
                rounded-lg md:rounded-xl
                border shadow-sm
                hover:shadow-md

                /* Mobile: icon-only centered layout */
                flex-col justify-center
                gap-1 py-2 px-1.5
                text-[10px] leading-tight

                /* SM: still compact but slightly larger */
                sm:flex-col sm:justify-center
                sm:gap-1 sm:py-2 sm:px-2
                sm:text-xs sm:leading-snug

                /* MD: switch to row layout */
                md:flex-row md:justify-start
                md:gap-2 md:py-2.5 md:px-3
                md:text-sm md:leading-normal

                /* LG: wider row, more padding */
                lg:flex-row lg:justify-start
                lg:gap-2.5 lg:py-3 lg:px-4
                lg:text-base lg:leading-normal

                /* XL */
                xl:gap-3 xl:py-3.5 xl:px-5
                xl:text-[17px]

                font-medium tracking-tight

                ${
                  isActive(item)
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                }
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="truncate hidden md:inline">{item.label}</span>
              <span className="truncate md:hidden text-center w-full leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Divider — only on LG+ */}
        <div className="hidden lg:block w-full h-px bg-gray-100 my-2 xl:my-3" />

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className={`
            flex items-center text-start text-red-600
            transition-all duration-200
            rounded-lg md:rounded-xl
            border border-red-200 shadow-sm
            hover:shadow-md hover:bg-red-50

            /* Mobile */
            flex-col justify-center
            gap-1 py-2 px-1.5
            text-[10px] leading-tight

            /* SM */
            sm:flex-col sm:justify-center
            sm:gap-1 sm:py-2 sm:px-2
            sm:text-xs

            /* MD */
            md:flex-row md:justify-start
            md:gap-2 md:py-2.5 md:px-3
            md:text-sm

            /* LG */
            lg:w-full lg:flex-row lg:justify-start
            lg:gap-2.5 lg:py-3 lg:px-4
            lg:text-base

            /* XL */
            xl:gap-3 xl:py-3.5 xl:px-5
            xl:text-[17px]

            font-medium tracking-tight
          `}
        >
          <span className="flex-shrink-0">
            <LogOut className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </span>
          <span className="truncate hidden md:inline">Sign Out</span>
          {/* Show label below icon on mobile/sm */}
          <span className="truncate md:hidden text-center w-full leading-tight">
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
};

export default SideNavbar;