"use client";

import { useState, useRef, useEffect } from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";
import { LuShare2 } from "react-icons/lu";

export default function ShareButton({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="
          flex items-center gap-2
          py-1 sm:py-1.5 px-3 sm:px-4
          text-xs sm:text-sm
          font-nun font-medium text-[#322F35]
          border border-[#919191] rounded-[10px]
          transition-all duration-300 ease-in-out
          hover:scale-105 hover:border-blue-500 hover:bg-blue-500 hover:text-white
        "
      >
        <LuShare2 className="text-sm" />
        Share
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-xl p-6 shadow-lg w-[90%] max-w-sm text-center"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Share this page
            </h3>

            <div className="flex justify-center gap-4 mb-4">
              <FacebookShareButton url={url} className="hover:opacity-80">
                <FacebookIcon size={40} round />
              </FacebookShareButton>

              <TwitterShareButton url={url} className="hover:opacity-80">
                <TwitterIcon size={40} round />
              </TwitterShareButton>

              <WhatsappShareButton url={url} className="hover:opacity-80">
                <WhatsappIcon size={40} round />
              </WhatsappShareButton>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="
                mt-2 px-4 py-1.5
                text-sm font-medium
                border border-gray-400 rounded-md
                hover:bg-gray-100 transition
              "
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
