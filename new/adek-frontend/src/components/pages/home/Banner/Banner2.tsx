/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  confirmCheckoutIcon,
  evaluateIcon,
  fastDeliveryIcon,
  freeReturn,
  moneyBack,
  serachAndSource,
  topNiche,
  trackAndRecoder,
} from "@/assets/icons/Home/homeIcons";
import bannerprofile from "@/assets/images/home/banner/bannerprofile.png";
import leftprofile from "@/assets/images/home/banner/leftprofile.png";
import rightprofile from "@/assets/images/home/banner/rightprofile.png";
import loicon from "@/assets/icons/Home/Frame.png";
import { Divider } from "antd";

import React from "react";
import Image from "next/image";
import StepIndicator from "./Stepper";
import BuyerJourney from "./BuyerJourney";
import { Button } from "@/components/ui/Button/Button";

const Banner2 = () => {
  return (
    <div className="bg-white">
      <div className="sm:py-10  py-6 container lg:px-16 md:px-14 sm:px-10 px-6 xl:px-0 mx-auto   ">
        <div className="flex  sm:gap-11 gap-none  justify-stretch  items-start  ">
          <div className="flex flex-wrap  items-center gap-2 max-w-full">
            {topNiche}
            <p className="  text-[10px] md:text-xs leading-3 md:leading-none lg:text-[18px] font-semibold text-color-32 sm:leading-6">
              Top Niche Brands
            </p>
          </div>

          <Divider type="vertical" className="h-[29px]" />

          <div className="flex flex-wrap  items-center gap-2 max-w-full">
            {fastDeliveryIcon}
            <p className="  text-[10px] md:text-xs leading-3 md:leading-none lg:text-[18px] font-semibold text-color-32  sm:leading-6">
              Fast Delivery Anytime
            </p>
          </div>
          <Divider type="vertical" className="h-[29px]" />
          <div className="flex flex-wrap  items-center gap-2 max-w-full">
            {freeReturn}
            <p className="  text-[10px] md:text-xs leading-3 md:leading-none lg:text-[18px] font-semibold text-color-32  sm:leading-6">
              Free Return within 90 Days
            </p>
          </div>
          <Divider type="vertical" className="h-[29px] w-[1px]" />
          <div className="flex flex-wrap  items-center gap-2 max-w-full">
            {moneyBack}
            <p className="  text-[10px] md:text-xs leading-3 md:leading-none lg:text-[18px] font-semibold text-color-32  sm:leading-6">
              Money Back Guarantee
            </p>
          </div>
        </div>

        <div className="flex gap-14 justify-center items-center lg:flex-row md:flex-col flex-col mt-6">
          <div className="flex justify-center flex-col w-full sm:w-[314px] items-center mt-4">
            <div className="  relative ">
              <div className="relative w-[143px] h-[143px] border-2 lg:mr-14 xl:mr-0 rounded-full flex justify-center items-center border-[#C2DEFF] ">
                <Image
                  src={bannerprofile}
                  alt=" "
                  height={132}
                  width={112}
                  className=" absolute -top-4 left-3 right-0 z-30 "
                />
                <Image
                  src={leftprofile}
                  alt=" "
                  className=" absolute top-5 left-0"
                />
                <Image
                  src={rightprofile}
                  alt=" "
                  className=" absolute bottom-5  right-0"
                />
              </div>
              <div className="bg-[#DAEBFF]  p-[4px] w-[143px] rounded-xl flex gap-2 justify-center items-center absolute top-0 lg:left-24 xl:left-30 md:left-28 left-20 ">
                <div>
                  <Image src={loicon} alt="" className="" />
                </div>
                <div>
                  <h6 className="text-color-dark text-[12px] w-[111px] ">
                    Your order is on the way
                  </h6>
                  <p className="text-[10px] text-[#606060] mt-1">3.2km</p>
                </div>
              </div>{" "}
              <div className="bg-[#FFD8C0] py-[4px] px-[6px] w-[143px] rounded-xl flex gap-2 justify-center items-center absolute -bottom-4 lg:-left-10 xl:-left-20 -left-20 md:-left-28 z-40 ">
                <div>
                  <Image src={loicon} alt="" className="" />
                </div>
                <div>
                  <h6 className="text-color-dark text-[12px] w-[111px] ">
                    Great deals with incredible sellers & buyers{" "}
                  </h6>
                </div>
              </div>
            </div>
          </div>
          {/* <div>
            <StepIndicator steps={5} currentStep={1} />
            <div className="flex gap-0 sm:gap-8 items-center justify-between xl:items-center lg:items-baseline md:items-center  sm:justify-start max-w-full sm:flex-nowrap flex-wrap   mt-4 ">
              <div className="flex  items-center sm:items-start flex-row  sm:flex-col gap-2 hover:bg-blue-primary/10 sm:px-5 sm:py-3 p-1 rounded-lg">
                {serachAndSource}
                <p className=" text-xs sm:text-base font-normal text-color-32">
                  Search & Source
                </p>
              </div>
              <div className="flex items-center sm:items-start flex-row   sm:flex-col gap-2 hover:bg-blue-primary/10sm: px-5sm: py- p-13 rounded-lg">
                {evaluateIcon}
                <p className=" text-xs sm:text-base font-normal text-color-32">
                  Evaluate Suppliers
                </p>
              </div>
              <div className="flex  items-center sm:items-start flex-row  sm:flex-col gap-2 hover:bg-blue-primary/10 sm:px-5 sm:py-3 p-1 rounded-lg">
                {confirmCheckoutIcon}
                <p className=" text-xs sm:text-base font-normal text-color-32">
                  Confirm & Checkout
                </p>
              </div>
              <div className="flex items-center sm:items-start flex-row   sm:flex-col gap-2 hover:bg-blue-primary/10sm: px-5sm: py- p-13 rounded-lg">
                {trackAndRecoder}
                <p className=" text-xs sm:text-base font-normal text-color-32">
                  Track & Reorder
                </p>
              </div>
              <div className="flex  items-center sm:items-start flex-row  sm:flex-col gap-2 hover:bg-blue-primary/10 sm:px-5 sm:py-3 p-1 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  fill="none"
                >
                  <rect
                    width="24"
                    height="24"
                    transform="translate(0.185547 0.235474)"
                    fill="white"
                  />
                  <path
                    d="M8.77396 16.2757C8.64623 16.7329 8.31681 17.0287 7.78572 17.1698C7.25463 17.311 6.81093 17.3782 6.46807 17.3782C6.12522 17.3782 5.78908 17.3379 5.45967 17.264C4.80085 17.0892 4.47144 16.753 4.47144 16.2757V8.23539C4.47144 7.77824 5.01597 7.44883 6.11177 7.24715C6.64286 7.14631 7.19412 7.09253 7.75211 7.09253C8.31009 7.09253 8.86807 7.14631 9.42606 7.24715C10.5151 7.44883 11.0664 7.77824 11.0664 8.23539C11.0597 8.23539 8.77396 16.2757 8.77396 16.2757ZM17.3857 16.2757C17.258 16.7329 16.9286 17.0287 16.3975 17.1698C15.8664 17.311 15.4227 17.3782 15.0798 17.3782C14.737 17.3782 14.4008 17.3379 14.0714 17.264C13.4126 17.0892 13.0832 16.753 13.0832 16.2757V8.23539C13.0832 7.77824 13.6277 7.44883 14.7235 7.24715C15.2546 7.14631 15.8059 7.09253 16.3639 7.09253C16.9219 7.09253 17.4798 7.14631 18.0445 7.24715C19.1336 7.44883 19.6849 7.77824 19.6849 8.23539L17.3857 16.2757Z"
                    fill="#FF914D"
                  />
                </svg>
                <p className=" text-xs sm:text-base font-normal text-color-32">
                  Request Quotation
                </p>
              </div>
            </div>
          </div> */}
          <BuyerJourney />
        </div>
      </div>
    </div>
  );
};

export default Banner2;
