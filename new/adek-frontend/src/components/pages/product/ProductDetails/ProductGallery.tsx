"use client";

import Image from "next/image";
import { useState, useRef } from "react";

type ProductType = string[];

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZDlkOWQ5Ii8+PC9zdmc+";

const FALLBACK_IMG = "/images.png";

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (!img.dataset.fallback) {
    img.srcset = FALLBACK_IMG;
    img.src = FALLBACK_IMG;
    img.dataset.fallback = "true";
  }
}

export default function ProductGallery({ product }: { product?: ProductType }) {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const visibleCount = 4;
  const [zoom, setZoom] = useState(false);
  const zoomRef = useRef<HTMLDivElement>(null);

  const mainImage = product?.[mainImageIndex] || FALLBACK_IMG;

  const handleMouseEnter = () => setZoom(true);
  const handleMouseLeave = () => setZoom(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomRef.current) return;
    const rect = zoomRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    zoomRef.current.style.backgroundPosition = `${x}% ${y}%`;
  };

  return (
    <div className="w-full">
      {/* ── Main Image ── */}
      <div
        className="relative w-full max-w-full mx-auto aspect-[566/516]
                   bg-[#D9D9D9] rounded-2xl overflow-hidden cursor-zoom-in"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={mainImage}
          alt="Product main image"
          fill
          sizes="
            (max-width: 576px)  100vw,
            (max-width: 768px)  100vw,
            (max-width: 992px)  50vw,
            (max-width: 1200px) 50vw,
            566px
          "
          className="object-cover rounded-2xl"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          priority          // above-the-fold hero image → eager load, no lazy
          onError={handleImgError}
        />

        {/* Zoom overlay */}
        {zoom && (
          <div
            ref={zoomRef}
            className="absolute inset-0 rounded-2xl pointer-events-none
                       bg-center bg-no-repeat bg-cover scale-150
                       transition-transform duration-300 ease-out"
            style={{ backgroundImage: `url(${mainImage})` }}
          />
        )}
      </div>

      {/* ── Thumbnail Strip ── */}
      <div
        className="w-full max-w-[566px] mx-auto
                   flex flex-wrap justify-center sm:justify-start
                   gap-3 sm:gap-4 mt-4 mb-6"
      >
        {product?.slice(0, visibleCount)?.map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImageIndex(index)}
            aria-label={`View product image ${index + 1}`}
            className={`rounded-xl overflow-hidden border-2 transition-all duration-200
                        active:scale-95
                        ${
                          index === mainImageIndex
                            ? "border-blue-500 scale-110 shadow-md"
                            : "border-transparent hover:border-gray-300 hover:scale-105"
                        }`}
          >
            <div
              className="
                relative bg-[#D9D9D9] rounded-xl overflow-hidden
                w-[64px]  h-[64px]
                sm:w-[76px]  sm:h-[76px]
                md:w-[82px]  md:h-[82px]
                lg:w-[88px]  lg:h-[88px]
                xl:w-[93px]  xl:h-[93px]
              "
            >
              <Image
                src={img}
                alt={`Product thumbnail ${index + 1}`}
                fill
                sizes="
                  (max-width: 576px)  64px,
                  (max-width: 768px)  76px,
                  (max-width: 992px)  82px,
                  (max-width: 1200px) 88px,
                  93px
                "
                className="object-cover rounded-xl"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                loading="lazy"   // thumbnails are below the hero, lazy is fine
                onError={handleImgError}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}