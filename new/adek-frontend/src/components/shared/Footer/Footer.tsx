"use client";
import Image from "next/image";
import {
  FaFacebook,
  FaInstagramSquare,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import icon1 from "@/assets/icons/footer/visa (1) 1.png";
import icon2 from "@/assets/icons/footer/Rectangle 34624194.png";
import icon3 from "@/assets/icons/footer/Frame (3).png";
import { useGetPlatformDataForUserSupportQuery } from "@/redux/features/banner/bannerSlice";
import { useRouter } from "next/navigation";
import { FaSquareXTwitter } from "react-icons/fa6";
const Footer = () => {
  const { data } = useGetPlatformDataForUserSupportQuery({});
  const router = useRouter();
  const footer = data?.result?.CmsSetting?.[0]?.footer;
  return (
    <div className="bg-[#000000] pt-8 pb-[72px] font-nun   ">
      <div className="container lg:px-16 md:px-14 sm:px-10 px-6 xl:px-0 mx-auto ">
        <div className=" grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 sm:gap-10 gap-8 items-start ">
          <div>
            <h6 className=" text-sm sm:text-[20px] font-nun text-white font-semibold">
              About Sellapy
            </h6>
            <ol>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 cursor-pointer"
                onClick={() => router.push("/company-Info")}
              >
                Company Info
              </li>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 cursor-pointer"
                onClick={() => router.push("/news")}
              >
                News
              </li>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 cursor-pointer"
                onClick={() => router.push("/investors")}
              >
                Investors
              </li>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 cursor-pointer"
                onClick={() => router.push("/policies")}
              >
                Policies
              </li>
            </ol>
          </div>
          <div>
            {" "}
            <h6 className=" text-sm sm:text-[20px] font-nun text-white font-semibold">
              Buy
            </h6>
            <ol>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 cursor-pointer"
                onClick={() => router.push("/auth/register")}
              >
                Registration
              </li>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 cursor-pointer"
                onClick={() => router.push("/money-back-guarantee")}
              >
                Money back guarantee
              </li>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 cursor-pointer"
                onClick={() => router.push("/seamless-buying")}
              >
                Seamless buying
              </li>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 cursor-pointer"
                onClick={() => router.push("/stores")}
              >
                Stores
              </li>
            </ol>
          </div>
          <div>
            <h6 className=" text-sm sm:text-[20px] font-nun text-white font-semibold">
              Sell
            </h6>
            <ol>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 cursor-pointer"
                onClick={() => router.push("/seller-account")}
              >
                Seller account
              </li>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 hidden cursor-pointer"
                onClick={() => router.push("/affiliate-program")}
              >
                Affiliates
              </li>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 cursor-pointer"
                onClick={() => router.push("/learn-to-sell")}
              >
                Learn to sell
              </li>
            </ol>
          </div>
          <div>
            <h6 className=" text-sm sm:text-[20px] font-nun text-white font-semibold">
              Stay connected
            </h6>
            <ol>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 flex items-center gap-4 corssor-pointer"
                onClick={() => window.open(`${footer?.facebookUrl}`, "_blank")}
              >
                <span className="text-[24px]">
                  <FaFacebook />
                </span>
                Facebook
              </li>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 flex items-center gap-4 corssor-pointer"
                onClick={() => window.open(`${footer?.linkedInUrl}`, "_blank")}
              >
                <span className="text-[24px]">
                  <FaLinkedinIn />
                </span>
                Linked in
              </li>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 flex items-center gap-4 corssor-pointer"
                onClick={() => window.open(`${footer?.twitterUrl}`, "_blank")}
              >
                <span className="text-[24px] ">
                  <FaSquareXTwitter />
                </span>{" "}
                Twitter
              </li>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 flex items-center gap-4 corssor-pointer"
                onClick={() => window.open(`${footer?.instagramUrl}`, "_blank")}
              >
                <span className="text-[24px] ">
                  <FaInstagramSquare />
                </span>{" "}
                Instagram
              </li>
              <li
                className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4 flex items-center gap-4 corssor-pointer"
                onClick={() => window.open(`${footer?.youtubeUrl}`, "_blank")}
              >
                <span className="text-[24px] ">
                  <FaYoutube />
                </span>{" "}
                YouTube
              </li>
            </ol>
          </div>
          <div>
            <h6 className=" text-sm sm:text-[20px] font-nun text-white font-semibold">
              Contact Us
            </h6>
            <ol>
              <li className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4">
                {footer?.contactPhone || "+1 (555) 000-0000"}
              </li>
              <li className="text-[#E6F2FF] font-normal text-xs sm:text-[18px] pt-4">
                info@sellapy.com
                {/* {footer?.contactEmail} */}
              </li>
              <li className="text-[#E6F2FF] font-normal leading-tight  text-xs sm:text-[18px] pt-4">
                {footer?.contactAddress}
              </li>
              <div className="flex gap-4 mt-8">
                <Image src={icon1} alt="" />
                <Image src={icon2} alt="" />
                <Image src={icon3} alt="" />
              </div>
            </ol>
          </div>
        </div>
        <div className="border-[#DEDEDE]/40 border-[1px] mt-6" />
        <p className="text-xs sm:text-base font-nun font-normal text-[#767676] mt-4 text-center">
          2026 Sellapy. All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;
