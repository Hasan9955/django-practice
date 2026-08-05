/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/Button/Button";
import ProductCard from "@/components/ui/Card/ProductCard";
import { cn } from "@/lib/utils";
import { useGetMostPopularProductsQuery } from "@/redux/features/product/productApi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

const PopularSlider = () => {
  const { data, isLoading, isError } = useGetMostPopularProductsQuery({});
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(true);
  // Drag state
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartX = React.useRef(0);
  const dragScrollLeft = React.useRef(0);
  const dragMoved = React.useRef(false);
  const ariaLabel = "Product carousel";

  const updateButtons = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth - 1;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft < maxScrollLeft);
  }, []);

  React.useEffect(() => {
    updateButtons();
    const el = viewportRef.current;
    if (!el) return;
    const onScroll = () => updateButtons();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => updateButtons());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [updateButtons]);

  function getStepAmount() {
    const el = viewportRef.current;
    if (!el) return 300;
    const firstCard = el.querySelector("[data-card]") as HTMLDivElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap || "16");
    const width = firstCard?.clientWidth ?? Math.round(el.clientWidth * 0.9);
    return Math.round(width + gap);
  }

  function scrollByAmount(dir: "prev" | "next") {
    const el = viewportRef.current;
    if (!el) return;
    const amount = getStepAmount();
    const behavior: ScrollBehavior = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
      ? "auto"
      : "smooth";
    el.scrollBy({ left: dir === "next" ? amount : -amount, behavior });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByAmount("next");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByAmount("prev");
    }
  }

  // Mouse drag handlers
  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button !== 0) return; // only left click
    // Ignore if clicking on a button or interactive element
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;

    const el = viewportRef.current;
    if (!el) return;
    setIsDragging(true);
    dragMoved.current = false;
    dragStartX.current = e.clientX;
    dragScrollLeft.current = el.scrollLeft;
    // Disable smooth behavior during drag for immediate response
    el.style.scrollBehavior = "auto";
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    const el = viewportRef.current;
    if (!el) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 3) dragMoved.current = true;
    el.scrollLeft = dragScrollLeft.current - dx;
    updateButtons();
  }

  function endDrag() {
    if (!isDragging) return;
    setIsDragging(false);
    const el = viewportRef.current;
    if (el) el.style.scrollBehavior = ""; // reset to CSS default (smooth via class)
  }

  React.useEffect(() => {
    // Attach move/up listeners to window while dragging
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => onMouseMove(e);
    const handleUp = () => endDrag();
    const handleLeave = () => endDrag();
    window.addEventListener("mousemove", handleMove, { passive: false });
    window.addEventListener("mouseup", handleUp, { passive: true });
    window.addEventListener("mouseleave", handleLeave, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mouseleave", handleLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  // Click anywhere in the viewport to go prev/next (but ignore clicks on cards)
  function onViewportClick(e: React.MouseEvent<HTMLDivElement>) {
    // If a drag occurred, treat as drag end, not click navigation
    if (dragMoved.current) return;
    const target = e.target as HTMLElement;
    // If the click originated inside a card, let the card handle it (e.g., navigate)
    if (target.closest("[data-card]")) return;
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const leftHalf = x < rect.width / 2;
    scrollByAmount(leftHalf ? "prev" : "next");
  }

  // Transform API data to match ProductCard props
  const transformProduct = (apiProduct: any) => {
    // Map productStatus to the expected status format
    const statusMap: Record<string, string> = {
      NewArrival: "top-selling",
      TopSelling: "top-selling",
      SuperDeal: "super-deal",
      StockOut: "stock-out",
      FlashSale: "flash-sale",
    };

    return {
      id: apiProduct.id,
      name: apiProduct.productName,
      image:
        apiProduct.productPhoto?.[0] ||
        "/placeholder.svg?height=208&width=320&query=product%20image",
      category: apiProduct.category?.name || "Uncategorized",
      price: apiProduct.discountPrice || apiProduct.basePrice,
      originalPrice:
        apiProduct.basePrice !== apiProduct.discountPrice
          ? apiProduct.basePrice
          : undefined,
      soldCount: apiProduct.totalSale || 0,
      rating: apiProduct.avgRating || 0,
      status: statusMap[apiProduct.productStatus] || "top-selling",
      discount:
        apiProduct.basePrice > apiProduct.discountPrice
          ? `${Math.round(
              ((apiProduct.basePrice - apiProduct.discountPrice) /
                apiProduct.basePrice) *
                100
            )}% OFF`
          : undefined,
    };
  };

  if (isLoading) {
    return (
      <main className="bg-[#F6F6F6]">
        <section className="xl:w-[1220px] mx-auto flex flex-col items-center justify-center py-10 md:py-20">
          <div className="text-center text-gray-600">
            Loading popular products...
          </div>
        </section>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="bg-[#F6F6F6]">
        <section className="xl:w-[1220px] mx-auto flex flex-col items-center justify-center py-10 md:py-20">
          <div className="text-center text-red-600">
            Failed to load popular products.
          </div>
        </section>
      </main>
    );
  }

  const products = data?.result?.data || [];

  if (products.length === 0) {
    return (
      <main className="bg-[#F6F6F6]">
        <section className="xl:w-[1220px] mx-auto flex flex-col items-center justify-center py-10 md:py-20">
          <h3 className="text-[#322F35] text-center font-nun sm:text-3xl text-2xl md:text-4xl xl:text-[40px] font-bold leading-[124%] mb-3 sm:mb-6">
            Most popular
          </h3>
          <div className="text-center text-gray-600">
            No products available.
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[#F6F6F6]">
      <section className="xl:w-[1220px] mx-auto flex flex-col items-center justify-center py-10 md:py-20 px-4 sm:px-6 lg:px-8">
        <h3 className="text-[#322F35] text-center font-nun sm:text-3xl text-2xl md:text-4xl xl:text-[40px] font-bold leading-[124%] mb-3 sm:mb-6">
          Most popular
        </h3>
        <div className={cn("relative w-full xl:w-[1220px] mx-auto")}>
          <div className="group relative" role="region" aria-label={ariaLabel}>
            <div
              ref={viewportRef}
              className={cn(
                "flex overflow-x-auto snap-x snap-mandatory scroll-smooth pr-2 select-none",
                "gap-3 sm:gap-4 lg:gap-5",
                "[scrollbar-width:none] [-ms-overflow-style:none]",
                isDragging ? "cursor-grabbing" : "cursor-grab"
              )}
              aria-roledescription="carousel"
              tabIndex={0}
              onKeyDown={onKeyDown}
              onWheel={updateButtons}
              role="list"
              style={{ scrollPaddingInline: "0.5rem" }}
              onMouseDown={onMouseDown}
              onClick={onViewportClick}
            >
              {/* Hide WebKit scrollbar */}
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>

              {products.map((p: any) => (
                <div
                  key={p.id}
                  data-card
                  role="listitem"
                  className={cn(
                    "snap-start shrink-0",
                    "w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[31vw] xl:w-[23vw] 2xl:w-[300px]",
                    "max-w-[320px]"
                  )}
                >
                  <ProductCard product={transformProduct(p)} />
                </div>
              ))}

              <div className="snap-end shrink-0 w-2" aria-hidden />
            </div>

            {/* Nav buttons with responsive sizing */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-1">
              <Button
                size="icon"
                variant="secondary"
                aria-label="Previous products"
                className={cn(
                  "rounded-full shadow-sm bg-white/90 hover:bg-white border",
                  "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10",
                  !canPrev && "opacity-50 cursor-not-allowed"
                )}
                disabled={!canPrev}
                onClick={() => scrollByAmount("prev")}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-1">
              <Button
                size="icon"
                variant="secondary"
                aria-label="Next products"
                className={cn(
                  "rounded-full shadow-sm bg-white/90 hover:bg-white border",
                  "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10",
                  !canNext && "opacity-50 cursor-not-allowed"
                )}
                disabled={!canNext}
                onClick={() => scrollByAmount("next")}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PopularSlider;
