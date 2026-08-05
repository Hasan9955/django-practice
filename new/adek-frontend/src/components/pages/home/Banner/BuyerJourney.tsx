"use client";
import { useAuthUser } from "@/redux/hooks";

import Link from "next/link";
import Swal from "sweetalert2";
const stepsData = [
  {
    number: 1,
    title: "Search & Source",
    description:
      "Effortlessly find niche products and trusted sellers in seconds.",
  },
  {
    number: 2,
    title: "Evaluate Suppliers",
    description: "Review verified suppliers and compare deals with confidence.",
  },
  {
    number: 3,
    title: "Confirm & Checkout",
    description: "Negotiate the best offers and complete payment securely.",
  },
  {
    number: 4,
    title: "Track & Reorder",
    description:
      "Monitor your delivery in real time and easily reorder favourites.",
  },
  {
    number: 5,
    title: "Request Quotation",
    description:
      "Instantly request new or repeat quotations for your next order.",
  },
];

const BuyerJourney: React.FC = () => {
  const user = useAuthUser();
  return (
    <div className="mx-auto w-full  ">
      {/* Flex layout for cards */}
      <div className="flex items-end justify-end">
        {user === null ? (
          <button
            onClick={() => {
              Swal.fire({
                title: "Please log in to continue",
                text: "You need to be logged in to access this feature.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Login",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
              }).then((result) => {
                if (result.isConfirmed) {
                  Swal.fire(
                    "Redirecting...",
                    "Taking you to the login page.",
                    "success",
                  );
                  // Example redirect:
                  window.location.href = "/auth/login";
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                  Swal.fire("Cancelled", "You chose not to log in.", "info");
                }
              });
            }}
            className="text-sm font-sans font-normal px-2 py-1.5 mb-2 rounded-md text-white bg-blue-primary cursor-pointer hover:bg-blue-700 transition-colors"
          >
            Login Required
          </button>
        ) : (
          <Link href="/account/B2B-portal">
            <button className="text-sm font-sans font-normal px-2 py-1.5 mb-2 rounded-md text-white bg-blue-primary cursor-pointer hover:bg-blue-700 transition-colors">
              Explore Wholesale Suppliers
            </button>
          </Link>
        )}
      </div>

      <div
        className="mx-auto max-w-4xl grid grid-cols-2 gap-2
                      sm:grid-cols-2 
                      md:grid-cols-3 
                      lg:grid-cols-3
                      xl:flex xl:flex-row lg:justify-center lg:gap-3"
      >
        {stepsData.map((step) => (
          <div
            key={step.number}
            className="group relative flex flex-col items-center text-center bg-white 
                       border border-gray-100 rounded-2xl shadow-sm transition-all duration-300 
                       hover:shadow-lg hover:border-blue-200
                       p-2 sm:p-3"
          >
            {/* Step Number Badge */}
            <div className="flex items-center justify-center mb-2">
              <div
                className="w-5 h-5 sm:h-8 sm:w-8 flex items-center justify-center 
                              rounded-full bg-blue-600 text-white font-bold 
                              text-base sm:text-lg shadow-md group-hover:scale-110 transition-transform"
              >
                {step.number}
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-1">
              <h3
                className="font-bold text-gray-900 leading-tight
                             text-sm sm:text-base"
              >
                {step.title}
              </h3>
              <p
                className="text-gray-600 leading-relaxed
                            text-[12px] sm:text-[13px]"
              >
                {step.description}
              </p>
            </div>

            {/* Optional: Desktop Arrow/Connector (Visible only on LG+) */}
            {step.number !== stepsData.length && (
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-[2px] bg-gray-100" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerJourney;
