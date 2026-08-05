"use client";

import { useState } from "react";
import Image from "next/image";
import imageDemo from "@/assets/images/home/bigsell.png";
import Link from "next/link";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";

export default function SalesCard() {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const users = useAppSelector(selectCurrentUser);
  const handleExploreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (users === null) {
      Swal.fire({
        title: "Login to Explore NicheHub",
        html: `
            Thank you for subscribing to our store updates. <br><br>
            <strong>Explore NicheHub fast — login now</strong>
          `,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Close",
        confirmButtonColor: "#004899",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/auth/login");
        }
      });
    } else {
      router.push("/nichehub");
    }
  };
  return (
    <div className="bg-color-pinkf6 font-nun container lg:px-16 md:px-14 sm:px-10 px-6 xl:px-0 mx-auto  ">
      <div className="relative w-full  bg-blue-500 overflow-hidden px-4 md:px-[60px] py-6 sm:py-20  rounded-2xl">
        <div className="flex flex-col gap-4 md:gap-20 md:flex-row items-center justify-center ">
          {/* Left side with image and sale card */}
          <div className="">
            <div className=" z-0">
              <Image
                src={imageDemo}
                alt="Shopping items collection"
                width={400}
                height={400}
                className="object-contain"
              />
            </div>
          </div>

          {/* Right side with text content */}
          <div className=" text-white text-center md:text-left w-full sm:w-[640px]">
            <h1 className=" text-[20px] sm:text-3xl md:text-4xl w-full lg:text-5xl font-bold leading-tight mb-2 sm:mb-4">
              Where unique brands drop their hottest finds.
            </h1>
            <p className="text-white/90 text-xs sm:text-lg mb-2 sm:mb-6 mx-auto md:mx-0">
              Scroll through trending products, creator-style feeds, and limited
              releases. Tap in and explore a world of niche, curated
              shopping—only on Sellapy.
            </p>
            <Link href="/nichehub" onClick={handleExploreClick}>
              <button
                className={`bg-white text-blue-600 px-6 py-3 text-xs sm:text-base rounded-full font-medium transition-transform duration-200 ${
                  isHovered ? "transform scale-105" : ""
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Explore NicheHub
              </button>
            </Link>
          </div>
        </div>

        {/* Top right corner button */}
        <div className="absolute top-4 right-4">
          <Link href="/nichehub" onClick={handleExploreClick}>
            <button className="bg-white/10 backdrop-blur-sm text-white border border-white/30 px-4 py-2 rounded-full text-sm hover:bg-white/20 transition-colors">
              Explore Our NicheHub
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
