/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react"; // ✅ no default React import
import { Image, Skeleton } from "antd";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import { TiEye } from "react-icons/ti";
import { Progress } from "antd";
import { BsChatLeftDots } from "react-icons/bs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
// Add these imports at the top
import { Select, Tag, Tooltip } from "antd";

import {
  useAddToCartProductMutation,
  useGetProductByIdQuery,
} from "@/redux/features/product/productApi";

import ProductGallery from "./ProductGallery";
import ProductDetailsAndFAQ from "./ProductDetailsAndFAQ";
import ProductTabs from "./ProductTabs";
import Moreproduct from "./Moreproduct";
import BackToTop from "./BackToTop";
import ShareButton from "@/components/ui/Button/ShareButton";
import B2BPackageCard from "@/components/ui/Card/B2BPackageCard";
import BundleOfferList, {
  SelectedBundle,
} from "@/components/ui/Card/BundleOfferList";
import CountdownTimer from "@/components/ui/CountdownTimer";
import PriceDisplay from "@/components/PriceDisplay";
import { PaymentModal } from "../../checkout/Paymentmodal";
import { useUserStoreQuery } from "@/redux/features/storeapi/storeApi";
import { RiStore2Line } from "react-icons/ri";
import { useAuthRedirect } from "@/utils/hooks/useAuthRedirect";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Variant {
  id: string;
  sku: string;
  stock: number;
  price: number;
  attributes: Record<string, string>;
  productId: string;
}

interface OrderItem {
  productName: string;
  storeId: string;
  variantId: string;
  sku: string;
  price: number;
  quantity: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
const isValidCssColor = (value: string): boolean => {
  if (!value) return false;
  const s = new Option().style;
  s.color = value;
  return s.color !== "";
};

// ─── Component ────────────────────────────────────────────────────────────────
const SingleProduct = () => {
  // ✅ All hooks at top — explicit generics prevent iterator type error
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<
    SelectedBundle | undefined
  >(undefined);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // ✅ RTK mutation — destructure correctly as tuple
  const [addToCartProduct] = useAddToCartProductMutation();
  const router = useRouter();
  const path = usePathname();
  const productId: string = path.split("/")[2];
  const { skip } = useAuthRedirect();
  console.log(skip, "not user ")
  const { data, isLoading, isError } = useGetProductByIdQuery(productId, {
    skip,
  });
  const storeId = data?.result?.product?.shop?.id;
  const { data: userStore, isLoading: userStoreLoading } =
    useUserStoreQuery(storeId);
  const variants: Variant[] = useMemo(
    () => (data?.result?.product?.Varient as Variant[]) ?? [],
    [data],
  );

  const attributeMap = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    variants.forEach((v) => {
      Object.entries(v.attributes ?? {}).forEach(([key, value]) => {
        if (!value) return;
        if (!map[key]) map[key] = [];
        if (!map[key].includes(value)) map[key].push(value);
      });
    });
    return map;
  }, [variants]);

  // ✅ useEffect before any early return
  useEffect(() => {
    if (variants.length > 0 && selectedVariant === null) {
      const first = variants[0];
      setSelectedVariant(first);
      setSelectedAttributes(first.attributes ?? {});
    }
  }, [variants]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16 pt-8 sm:pt-10 md:pt-12 pb-12 min-h-screen">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12">
          <div className="w-full md:w-1/2">
            <div className="w-full h-[420px] sm:h-[480px] md:h-[520px] bg-[#D9D9D9] rounded-2xl overflow-hidden">
              <Skeleton.Image
                active
                style={{ width: "100%", height: "100%" }}
                className="rounded-2xl w-full h-full object-cover bg-center"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-6 md:space-y-8">
            <Skeleton active paragraph={{ rows: 6 }} />
            <Skeleton.Button active block size="large" />
            <Skeleton active paragraph={{ rows: 10 }} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (isError || !data?.result?.product) {
    return (
      <div className="text-center py-20 text-2xl text-red-600">
        Product not found or error occurred.
      </div>
    );
  }
  if (isError || !data?.result?.product) {
    router.push("/auth/login");
  }

  const product = data.result.product;
  const moreProduct: any[] = data.result.moreProduct ?? [];
  const sellerId: string =
    product.shop?.sellerId ?? moreProduct[0]?.shop?.sellerId ?? "";

  const totalStock: number = variants.reduce(
    (sum, v) => sum + (v.stock ?? 0),
    0,
  );
  const percent: number = Math.min(Math.round((totalStock / 200) * 100), 100);

  const activePrice: number =
    selectedVariant?.price ?? product.discountPrice ?? product.basePrice ?? 0;

  // ─── Attribute select (score-based matching) ───────────────────────────────
  const handleSelectAttribute = (key: string, value: string): void => {
    const isAlreadySelected = selectedAttributes[key] === value;
    const newAttrs: Record<string, string> = isAlreadySelected
      ? Object.fromEntries(
          Object.entries(selectedAttributes).filter(([k]) => k !== key),
        )
      : { ...selectedAttributes, [key]: value };

    const newAttrEntries = Object.entries(newAttrs);

    if (newAttrEntries.length === 0) {
      setSelectedAttributes({});
      setSelectedVariant(variants[0] ?? null);
      toast("Showing default variant", { icon: "ℹ️" });
      return;
    }

    const scored = variants.map((v) => ({
      variant: v,
      score: newAttrEntries.filter(([k, val]) => v.attributes[k] === val)
        .length,
    }));

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aExtra = Object.keys(a.variant.attributes).length - a.score;
      const bExtra = Object.keys(b.variant.attributes).length - b.score;
      return aExtra - bExtra;
    });

    const best = scored[0];

    if (best.score === 0) {
      toast.error("No variant available for this combination!");
      setSelectedAttributes(newAttrs);
      return;
    }

    setSelectedAttributes(newAttrs);

    if (best.variant.id !== selectedVariant?.id) {
      setSelectedVariant(best.variant);
      toast.success(`Variant: ${best.variant.sku}`, { duration: 2000 });
    }
  };

  // ─── Add to Cart ───────────────────────────────────────────────────────────
  const handleAddToCart = async (): Promise<void> => {
    const variantId = selectedVariant?.id ?? variants[0]?.id;
    if (!variantId) {
      toast.error("No variant available!");
      return;
    }
    try {
      const res = await addToCartProduct({
        productId: product.id,
        variantId,
      }).unwrap();
      res?.success
        ? toast.success("Added to cart!")
        : toast.error(res?.message ?? "Failed to add");
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Failed to add to cart");
    }
  };

  // ─── Buy Now ───────────────────────────────────────────────────────────────
  const handlePaymentBuyNow = (): void => {
    const variantId = selectedVariant?.id ?? variants[0]?.id;
    if (!variantId) {
      toast.error("Please select a variant!");
      return;
    }
    setOrders([
      {
        productName: product.productName,
        storeId: product.storeId,
        variantId,
        sku: selectedVariant?.sku ?? variants[0]?.sku ?? "",
        price: activePrice,
        quantity: 1,
      },
    ]);
    setModalOpen(true);
  };

  // ─── Buy Now Bundle ────────────────────────────────────────────────────────
  const handleBuyNowBundles = (): void => {
    const variantId = selectedVariant?.id ?? variants[0]?.id;
    if (!variantId) {
      toast.error("Please select a variant!");
      return;
    }
    const itemPrice: number = product?.basePrice ?? variants[0]?.price ?? 0;
    const bundleDiscount: number = selectedBundle?.discount ?? 0;
    const quantity: number = selectedBundle?.quantity ?? 1;
    const discountedPrice: number =
      itemPrice - (itemPrice * bundleDiscount) / 100;

    setOrders([
      {
        productName: product.productName,
        storeId: product.storeId,
        variantId,
        sku: selectedVariant?.sku ?? variants[0]?.sku ?? "",
        price: discountedPrice,
        quantity,
      },
    ]);
    setModalOpen(true);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="container lg:px-16 md:px-14 sm:px-10 px-6 xl:px-0 mx-auto pt-6 sm:pt-8 md:pt-10 lg:pt-20 pb-10">
        <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-4 lg:gap-11">
          {/* Left: Gallery */}
          <div className="md:w-1/2 w-full">
            <ProductGallery product={product.productPhoto} />
            <div className="hidden md:block mt-8">
              <ProductDetailsAndFAQ
                product={product}
                defaultOpenKey="details"
              />
            </div>
          </div>

          {/* Right: Info */}
          <div className="md:w-1/2 w-full">
            {/* Rating */}
            <div className="lg:px-6 px-2 py-2 bg-[#E3EAF0] rounded-[28px] gap-3 flex justify-center items-center w-[230px] sm:w-[330px]">
              <h6 className="font-nun font-semibold text-xs sm:text-sm lg:text-lg text-color-dark">
                {product.totalSale > 0
                  ? `${product.totalSale}+ reviews`
                  : "No reviews yet"}
              </h6>
              <div className="flex text-xs sm:text-[15px] gap-1">
                {[...Array(5)].map((_, i) =>
                  i < Math.floor(product.avgRating ?? 0) ? (
                    <FaStar key={i} className="text-blue-400" />
                  ) : (
                    <FaRegStar key={i} className="text-blue-400" />
                  ),
                )}
              </div>
              <p className="text-color-dark text-xs sm:text-[15px] font-jos">
                ({product.avgRating?.toFixed(1) ?? "0.0"})
              </p>
            </div>

            {/* Name */}
            <h3 className="w-full text-black font-nunito text-xl sm:text-3xl md:text-3xl xl:text-[40px]/10 leading-0 md:leading-10 py-4 font-semibold">
              {product.productName}
            </h3>

            {/* Price */}
            <div className="flex items-center justify-start pt-2 lg:pt-4 pb-2 sm:pb-3 lg:pb-7 flex-wrap gap-2">
              <PriceDisplay
                basePrice={activePrice}
                showCode={false}
                className="font-nun text-base sm:text-[28px] font-bold text-[#007BFF] pr-3"
              />
              {product.basePrice && product.discountPrice && (
                <>
                  <PriceDisplay
                    basePrice={product.basePrice}
                    showCode={false}
                    className="text-sm sm:text-lg font-inter text-[#666] line-through"
                  />
                  {product.discountPrice !== 0 && (
                    <span className="sm:py-2 sm:px-2.5 py-1.5 px-2 bg-[#FF0606] text-xs sm:text-sm text-white font-nun font-medium rounded-xl ml-2">
                      Save{" "}
                      {Math.round(
                        ((product.basePrice - product.discountPrice) /
                          product.basePrice) *
                          100,
                      )}
                      %
                    </span>
                  )}
                </>
              )}
            </div>

            {/* B2B */}
            {product.B2BPackage?.length > 0 && (
              <div className="border-y border-[#DADADA] py-4 sm:py-6 md:py-8">
                <p className="text-xs text-neutral-500 font-semibold mb-3 uppercase tracking-widest">
                  Wholesale Pricing
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                  {product.B2BPackage.slice(0, 3).map(
                    (offer: any, i: number) => (
                      <B2BPackageCard key={offer.id ?? i} offer={offer} />
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Viewers */}
            <div className="flex pt-4 gap-2 items-center">
              <TiEye className="text-[22px]" />
              <h5 className="text-xs sm:text-base font-inter text-[#8A8A8A]">
                {product.totalView ?? 0} people are viewing this right now
              </h5>
            </div>
            {product.discountPrice !== 0 && (
              <CountdownTimer
                discountStartDate={product.discountStartDate}
                discountEndTime={product.discountEndTime}
              />
            )}

            <div>
              {userStoreLoading ? (
                <Skeleton active />
              ) : (
                <div className="flex gap-2 mt-4 items-center">
                  <RiStore2Line />
                  <div>
                    {userStore?.result?.country} {userStore?.result?.city}
                  </div>
                </div>
              )}
            </div>

            {/* Stock */}
            <div className="mt-6">
              <p className="font-inter text-xs sm:text-base text-[#666]">
                {totalStock <= 10 && (
                  <span className="text-red-500 font-semibold">Only </span>
                )}
                <span className="font-bold">{totalStock}</span> item(s) left!
              </p>
              <Progress
                percent={percent}
                size="small"
                showInfo={false}
                strokeColor="#FF0606"
              />
            </div>

            {/* Dynamic Attributes */}
            {Object.keys(attributeMap).length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                {Object.entries(attributeMap).map(([attrKey, values]) => {
                  const isColorKey = attrKey.toLowerCase() === "color";
                  const selectedVal = selectedAttributes[attrKey];

                  return (
                    <div key={attrKey} className="flex flex-col gap-2">
                      {/* ── Label ── */}
                      <div className="flex items-center gap-2">
                        <span className="capitalize text-sm font-semibold text-gray-700">
                          {attrKey}
                        </span>
                        {selectedVal && (
                          <Tag
                            color="blue"
                            className="!text-[11px] !px-2 !py-0 !rounded-full !border-0 !m-0"
                          >
                            {selectedVal}
                          </Tag>
                        )}
                      </div>

                      {/* ── Ant Design Select ── */}
                      <Select
                        value={selectedVal ?? undefined}
                        placeholder={
                          <span className="text-gray-400 text-sm">
                            Select {attrKey}
                          </span>
                        }
                        allowClear
                        onClear={() => {
                          // deselect by toggling current value off
                          if (selectedVal) {
                            handleSelectAttribute(attrKey, selectedVal);
                          }
                        }}
                        onChange={(val: string) => {
                          if (val) handleSelectAttribute(attrKey, val);
                        }}
                        size="large"
                        className="w-full"
                        style={{
                          borderRadius: "12px",
                          ...(selectedVal
                            ? { boxShadow: "0 0 0 2px #3b82f620" }
                            : {}),
                        }}
                        optionLabelProp="label"
                      >
                        {values.map((value) => {
                          const validColor =
                            isColorKey && isValidCssColor(value);

                          return (
                            <Select.Option
                              key={value}
                              value={value}
                              label={
                                // What shows inside the select box after selection
                                <div className="flex items-center gap-2">
                                  {validColor && (
                                    <span
                                      className="inline-block w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                                      style={{ backgroundColor: value }}
                                    />
                                  )}
                                  <span className="capitalize text-sm">
                                    {value}
                                  </span>
                                </div>
                              }
                            >
                              {/* What shows in the dropdown list */}
                              <div className="flex items-center gap-2.5 py-0.5">
                                {validColor ? (
                                  <span
                                    className="inline-block w-5 h-5 rounded-full border border-gray-200 flex-shrink-0 shadow-sm"
                                    style={{ backgroundColor: value }}
                                  />
                                ) : (
                                  <span className="inline-block w-5 h-5 rounded-md bg-gray-100 border border-gray-200 flex-shrink-0 text-[9px] font-bold text-gray-500  items-center justify-center uppercase leading-none">
                                    {value.charAt(0)}
                                  </span>
                                )}
                                <span className="capitalize text-sm text-gray-700">
                                  {value}
                                </span>
                                {selectedVal === value && (
                                  <Tag
                                    color="blue"
                                    className="!text-[10px] !px-1.5 !py-0 !rounded-full !border-0 ml-auto !m-0"
                                  >
                                    selected
                                  </Tag>
                                )}
                              </div>
                            </Select.Option>
                          );
                        })}
                      </Select>

                      {/* ── Color Swatch Row (color key only) ── */}
                      {isColorKey && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {values.map((value) => {
                            const validColor = isValidCssColor(value);
                            const isActive = selectedVal === value;

                            return (
                              <Tooltip
                                key={value}
                                title={
                                  <span className="capitalize text-xs">
                                    {value}
                                  </span>
                                }
                                placement="top"
                                mouseEnterDelay={0.2}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSelectAttribute(attrKey, value)
                                  }
                                  className={`
                        relative w-7 h-7 rounded-full
                        border-2 transition-all duration-200
                        focus:outline-none flex-shrink-0
                        flex items-center justify-center
                        ${
                          isActive
                            ? "border-blue-500 scale-110 shadow-md ring-2 ring-blue-200 ring-offset-1"
                            : "border-gray-300 hover:border-gray-500 hover:scale-105"
                        }
                      `}
                                  style={{
                                    backgroundColor: validColor
                                      ? value
                                      : "#f3f4f6",
                                  }}
                                >
                                  {/* Non-CSS color: letter fallback */}
                                  {!validColor && (
                                    <span className="text-[8px] font-bold text-gray-600 uppercase leading-none">
                                      {value.charAt(0)}
                                    </span>
                                  )}
                                  {/* Active checkmark */}
                                  {isActive && (
                                    <span
                                      className={`
                            absolute inset-0 flex items-center justify-center
                            text-[10px] font-bold
                            ${
                              validColor
                                ? "text-white drop-shadow"
                                : "text-blue-600"
                            }
                          `}
                                    >
                                      ✓
                                    </span>
                                  )}
                                </button>
                              </Tooltip>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Variant Feedback */}
            {selectedVariant && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                {/* Top Row: SKU + Price */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {selectedVariant.sku}
                    </span>
                  </div>
                  <PriceDisplay
                    basePrice={selectedVariant.price}
                    showCode={false}
                    className="text-[#007BFF] font-bold text-base flex-shrink-0 ml-3"
                  />
                </div>

                {/* Attribute Tags */}
                {Object.entries(selectedVariant.attributes ?? {}).length >
                  0 && (
                  <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
                    {Object.entries(selectedVariant.attributes).map(
                      ([k, v]) => {
                        const isColorAttr = k.toLowerCase() === "color";
                        const isColorValue = isColorAttr && isValidCssColor(v);

                        return (
                          <div
                            key={k}
                            className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2.5 py-0.5"
                          >
                            <span className="text-[11px] text-gray-400 capitalize">
                              {k}:
                            </span>
                            {isColorValue && (
                              <span
                                className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                                style={{ backgroundColor: v }}
                              />
                            )}
                            <span className="text-[11px] font-semibold text-gray-700 capitalize">
                              {v}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              {/* Buy Now */}
              <button
                onClick={handlePaymentBuyNow}
                className="flex-1 min-w-[140px] sm:flex-none py-3 px-8 bg-[#EA580B] text-white font-bold rounded-xl hover:scale-105 transition text-sm sm:text-base whitespace-nowrap"
              >
                Buy Now
              </button>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 min-w-[140px] sm:flex-none py-3 px-8 border border-[#919191] font-medium rounded-xl hover:bg-blue-500 hover:text-white hover:border-blue-500 transition text-sm sm:text-base whitespace-nowrap"
              >
                Add to Cart
              </button>

              {/* Chat Now */}
              <Link
                href={`/products/${product.id}/${sellerId}`}
                className="flex-1 min-w-[140px] sm:flex-none"
              >
                <button className="w-full py-3 px-8 border border-[#919191] flex items-center justify-center gap-2 font-medium rounded-xl hover:bg-blue-500 hover:text-white hover:border-blue-500 transition text-sm sm:text-base whitespace-nowrap">
                  <BsChatLeftDots /> Chat Now
                </button>
              </Link>

              {/* Share Button — forced to match other buttons */}
              <div className="flex-1 min-w-[130px] sm:flex-none [&>button]:w-full [&>button]:py-3 [&>button]:px-8 [&>button]:border [&>button]:border-[#919191] [&>button]:font-medium [&>button]:rounded-xl [&>button]:hover:bg-blue-500 [&>button]:hover:text-white [&>button]:transition [&>button]:text-sm sm:[&>button]:text-base [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:gap-2">
                <ShareButton
                  url={
                    typeof window !== "undefined" ? window.location.href : ""
                  }
                />
              </div>
            </div>

            {/* Bundle */}
            {product.BundleOffer?.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-semibold mb-6">
                  Buy more, save more
                </h3>
                <BundleOfferList
                  basePrice={product?.basePrice ?? variants[0]?.price ?? 0}
                  bundleOffers={product.BundleOffer}
                  selectedBundle={selectedBundle}
                  setSelectedBundle={setSelectedBundle}
                />
                <button
                  onClick={handleBuyNowBundles}
                  className="mt-6 py-3 px-12 bg-[#007BFF] text-white font-medium rounded-2xl hover:bg-blue-700 transition"
                >
                  Buy Now with Bundle
                </button>
              </div>
            )}

            <div className="md:hidden  mt-4">
              <ProductDetailsAndFAQ
                product={product}
                defaultOpenKey="details"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold mb-6">Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {product.productPhoto?.slice(0, 8).map((img: string, i: number) => (
              <div key={i} className="overflow-hidden rounded-2xl">
                <Image
                  src={img}
                  alt={`product-image-${i}`}
                  width={400}
                  height={300}
                  className="w-full object-cover hover:scale-105 transition"
                />
              </div>
            ))}
          </div>
        </div>

        <ProductTabs product={product} />
        <Moreproduct products={moreProduct} isLoading={false} />
        <BackToTop />
      </div>

      {modalOpen && (
        <PaymentModal orders={orders} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
};

export default SingleProduct;
