/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import {
  Trash2,
  Check,
  ChevronRight,
  Clock,
  Package,
  ShieldCheck,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Checkbox, Skeleton } from "antd";
import { Input } from "@/components/ui/Input/Input";
import { Separator } from "@/components/ui/Separator/separator";
import ComplementaryProducts from "../product/ComplementaryProducts";
import FooterSing from "./FooterSing";
import {
  useApplyCouponMutation,
  useGetAllCartQuery,
  useRemoveFromCartMutation,
} from "@/redux/features/product/productApi";
import { useState, useEffect } from "react";
import PriceDisplay from "@/components/PriceDisplay";
import ShipingPlocey from "./ShipingPlocey";
import { PaymentModal } from "../checkout/Paymentmodal";
import { useGetPlatformDataForUserSupportQuery } from "@/redux/features/banner/bannerSlice";

// ─── Shared type (matches product page & PaymentModal) ───────────────────────
type OrderItem = {
  productName: string;
  storeId: string;
  variantId: string;
  sku: string;
  price: number;
  quantity: number;
};

// ─── Selected cart item internal shape ───────────────────────────────────────
type SelectedItem = {
  variantId: string;
  sku: string;
  storeId: string;
  quantity: number;
  price: number;
  tax: number;
  deliveryCharge: number;
  couponDiscount: number;
  finalPrice: number;
  productName: string;
};

export default function CartPage() {
  const { data, isLoading } = useGetAllCartQuery({});
  const [removeFromCart] = useRemoveFromCartMutation();
  const [applyCoupon] = useApplyCouponMutation();

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [coupon, setCoupon] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discounts: Record<string, number>;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]);

  const { data: platformData } = useGetPlatformDataForUserSupportQuery({});
  const TAX_PERCENTAGE: number = platformData?.result?.commisionRate ?? 0;

  const cartData = data?.result ?? [];

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const calculateItemTax = (price: number): number =>
    (price * TAX_PERCENTAGE) / 100;

  const updateSelectedItemsWithCalculations = (
    items: SelectedItem[]
  ): SelectedItem[] =>
    items.map((item) => {
      const tax = calculateItemTax(item.price);
      return {
        ...item,
        tax,
        couponDiscount: item.couponDiscount ?? 0,
        finalPrice: item.price + tax,
      };
    });

  // ─── Initialise / sync cart data ──────────────────────────────────────────

  useEffect(() => {
    if (cartData.length === 0) return;

    const allItems: SelectedItem[] = cartData.map((item: any) => ({
      variantId: item.variant.id,
      storeId: item.product.storeId,
      quantity: 1,
      price: item.variant.price,
      sku: item.variant.sku,
      productName: item.product.productName,
      tax: 0,
      deliveryCharge: 0,
      couponDiscount: 0,
      finalPrice: 0,
    }));

    setSelectedItems(updateSelectedItemsWithCalculations(allItems));

    const initialQty: Record<string, number> = {};
    cartData.forEach((item: any) => {
      initialQty[item.id] = 1;
    });
    setQuantities(initialQty);
  }, [cartData]);

  // ─── Remove from cart ─────────────────────────────────────────────────────

  const handleRemoveFromCart = async (cartItemId: string) => {
    try {
      await removeFromCart({ productIds: [cartItemId] }).unwrap();
      toast.success("Item removed from cart.");
      setQuantities((prev) => {
        const next = { ...prev };
        delete next[cartItemId];
        return next;
      });
    } catch {
      toast.error("Failed to remove item from cart.");
    }
  };

  // ─── Quantity controls ────────────────────────────────────────────────────

  const handleIncreaseQuantity = (cartItemId: string, variantId: string) => {
    const newQty = (quantities[cartItemId] ?? 1) + 1;
    setQuantities((prev) => ({ ...prev, [cartItemId]: newQty }));

    setSelectedItems((prev) => {
      const updated = prev.map((item) => {
        if (item.variantId !== variantId) return item;
        const unitPrice = item.price / item.quantity;
        return { ...item, quantity: newQty, price: unitPrice * newQty };
      });
      return updateSelectedItemsWithCalculations(updated);
    });
  };

  const handleDecreaseQuantity = (cartItemId: string, variantId: string) => {
    const currentQty = quantities[cartItemId] ?? 1;
    if (currentQty <= 1) return;

    const newQty = currentQty - 1;
    setQuantities((prev) => ({ ...prev, [cartItemId]: newQty }));

    setSelectedItems((prev) => {
      const updated = prev.map((item) => {
        if (item.variantId !== variantId) return item;
        const unitPrice = item.price / item.quantity;
        return { ...item, quantity: newQty, price: unitPrice * newQty };
      });
      return updateSelectedItemsWithCalculations(updated);
    });
  };

  // ─── Selection ────────────────────────────────────────────────────────────

  const handleToggleItem = (
    cartItemId: string,
    variantId: string,
    price: number,
    storeId: string
  ) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some((item) => item.variantId === variantId);
      let updated: SelectedItem[];

      if (isSelected) {
        updated = prev.filter((item) => item.variantId !== variantId);
      } else {
        const qty = quantities[cartItemId] ?? 1;
        const cartItem = cartData.find((ci: any) => ci.id === cartItemId);

        updated = [
          ...prev,
          {
            variantId,
            storeId,
            quantity: qty,
            sku: cartItem?.variant?.sku ?? "",
            productName: cartItem?.product?.productName ?? "",
            price: price * qty,
            tax: 0,
            deliveryCharge: 0,
            couponDiscount: 0,
            finalPrice: 0,
          },
        ];
      }

      return updateSelectedItemsWithCalculations(updated);
    });
  };

  const handleToggleAll = () => {
    if (selectedItems.length === cartData.length) {
      setSelectedItems([]);
      return;
    }

    const allItems: SelectedItem[] = cartData.map((item: any) => {
      const qty = quantities[item.id] ?? 1;
      return {
        variantId: item.variant.id,
        storeId: item.product.storeId,
        quantity: qty,
        sku: item.variant.sku,
        productName: item.product.productName,
        price: item.variant.price * qty,
        tax: 0,
        deliveryCharge: 0,
        couponDiscount: 0,
        finalPrice: 0,
      };
    });

    setSelectedItems(updateSelectedItemsWithCalculations(allItems));
  };

  // ─── Coupon ───────────────────────────────────────────────────────────────

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please select items to apply the coupon.");
      return;
    }

    const payload = {
      code: coupon,
      variants: selectedItems.map((item) => ({
        variantId: item.variantId,
        storeId: item.storeId,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const response: any = await applyCoupon(payload).unwrap();

      if (response?.success && response?.result) {
        const updatedItems: SelectedItem[] = selectedItems.map((item) => {
          const responseItem = response.result.items.find(
            (r: any) => r.variantId === item.variantId
          );

          if (responseItem?.eligible && responseItem.discountAmount > 0) {
            return {
              ...item,
              price: responseItem.total,
              couponDiscount: responseItem.discountAmount,
              tax: 0,
              deliveryCharge: 0,
              finalPrice: 0,
            };
          }

          // not eligible — restore original unit price × quantity
          const cartItem = cartData.find(
            (ci: any) => ci.variant.id === item.variantId
          );
          const unitPrice = cartItem?.variant?.price ?? 0;
          return {
            ...item,
            price: unitPrice * item.quantity,
            couponDiscount: 0,
            tax: 0,
            deliveryCharge: 0,
            finalPrice: 0,
          };
        });

        setSelectedItems(updateSelectedItemsWithCalculations(updatedItems));
        setAppliedCoupon({ code: response.result.coupon.code, discounts: {} });
        toast.success("Coupon applied successfully!");
      } else {
        toast.error("Failed to apply coupon.");
      }
    } catch {
      toast.error("Failed to apply coupon.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCoupon("");

    const resetItems: SelectedItem[] = selectedItems.map((item) => {
      const cartItem = cartData.find(
        (ci: any) => ci.variant.id === item.variantId
      );
      const unitPrice = cartItem?.variant?.price ?? 0;
      return {
        ...item,
        price: unitPrice * item.quantity,
        couponDiscount: 0,
        tax: 0,
        deliveryCharge: 0,
        finalPrice: 0,
      };
    });

    setSelectedItems(updateSelectedItemsWithCalculations(resetItems));
    toast.info("Coupon removed");
  };

  // ─── Summary calculations ─────────────────────────────────────────────────

  const selectedCartItems = cartData.filter((item: any) =>
    selectedItems.some((s) => s.variantId === item.variant.id)
  );

  const calculateSubtotal = () =>
    selectedItems.reduce((sum, item) => sum + item.price, 0);

  // const calculateTax = () =>
  //   selectedItems.reduce((sum, item) => sum + item.tax, 0);

  const calculateTotalDiscount = () =>
    selectedCartItems.reduce((sum: number, item: any) => {
      const base = item.product?.basePrice ?? 0;
      const variant = item.variant?.price ?? 0;
      const qty = quantities[item.id] ?? 1;
      return sum + (base > variant ? (base - variant) * qty : 0);
    }, 0);

  const calculateTotalCouponDiscount = () =>
    selectedItems.reduce((sum, item) => sum + item.couponDiscount, 0);

  const calculateTotal = () =>
    selectedItems.reduce((sum, item) => sum + item.finalPrice, 0);

  // ─── Checkout ─────────────────────────────────────────────────────────────

  const handlePayment = () => {
    if (selectedItems.length === 0) return;

    const mapped: OrderItem[] = selectedItems.map((item) => ({
      productName: item.productName,
      storeId: item.storeId,
      variantId: item.variantId,
      sku: item.sku,
      price: item.price / item.quantity, // tax-inclusive final price
      quantity: item.quantity,
    }));

    setOrders(mapped);
    setModalOpen(true);
  };

  // ─── Derived flags ────────────────────────────────────────────────────────

  const isAllSelected =
    cartData.length > 0 && selectedItems.length === cartData.length;
  const isSomeSelected =
    selectedItems.length > 0 && selectedItems.length < cartData.length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 lg:mt-12 sm:mt-8 mt-4">
      <h3 className="text-[#0B0F0E] font-nun text-base sm:text-lg lg:text-[24px] font-semibold mb-6">
        Let&#39;s Get You Checked Out
      </h3>

      <div className="gap-6 lg:gap-8 flex flex-col lg:flex-row">
        {/* ── Left: Cart Items ── */}
        {isLoading ? (
          <div className="w-full lg:w-2/3">
            <Skeleton active />
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg w-full lg:w-2/3 h-fit overflow-hidden">
            {cartData.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onChange={handleToggleAll}
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({selectedItems.length}/{cartData.length})
                </span>
              </div>
            )}

            {cartData.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Your cart is empty
              </div>
            ) : (
              cartData.map((item: any) => {
                const product = item.product;
                const variant = item.variant;
                const price = variant?.price ?? 0;
                const basePrice = product?.basePrice ?? 0;
                const hasDiscount = basePrice > price;
                const isSelected = selectedItems.some(
                  (s) => s.variantId === variant.id
                );
                const quantity = quantities[item.id] ?? 1;

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col p-3 gap-3 border-b border-gray-200 last:border-b-0 transition-colors ${
                      isSelected ? "bg-blue-50/30" : "bg-white"
                    }`}
                  >
                    {/* Checkbox + Product Info */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Checkbox
                        className="mt-1 flex-shrink-0"
                        checked={isSelected}
                        onChange={() =>
                          handleToggleItem(
                            item.id,
                            variant.id,
                            price,
                            product.storeId
                          )
                        }
                      />

                      <div className="bg-gray-100 rounded-lg p-1.5 sm:p-2 flex-shrink-0">
                        <Image
                          src={product?.productPhoto?.[0] ?? "/placeholder.png"}
                          alt={product?.productName ?? "Product"}
                          width={100}
                          height={100}
                          className="rounded-md object-cover w-16 h-16 sm:w-20 sm:h-20 lg:w-[100px] lg:h-[100px]"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-[#0B0F0E] text-sm sm:text-base lg:text-lg font-normal leading-snug tracking-tight break-words pr-1">
                          {product?.productName}
                        </h3>
                        {variant?.sku && (
                          <p className="text-xs text-gray-500 mt-1">
                            SKU: {variant.sku}
                          </p>
                        )}
                        {variant?.stock !== undefined && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Stock: {variant.stock}
                          </p>
                        )}

                        <div className="w-full flex">
                          <div className="flex items-center gap-2 mt-1.5">
                            <PriceDisplay
                              basePrice={price}
                              showCode={false}
                              className="text-[#1D9E34] text-base sm:text-lg font-medium"
                            />
                            {hasDiscount && (
                              <PriceDisplay
                                basePrice={basePrice}
                                showCode={false}
                                className="text-gray-400 text-xs sm:text-sm line-through"
                              />
                            )}
                          </div>

                          {/* Desktop quantity controls */}
                          <div className="items-center gap-2 flex-1 justify-end hidden sm:flex">
                            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 sm:h-8 sm:w-8 rounded-none hover:bg-gray-100"
                                onClick={() =>
                                  handleDecreaseQuantity(item.id, variant.id)
                                }
                                disabled={quantity <= 1}
                              >
                                <Minus className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                              </Button>
                              <span className="px-3 sm:px-4 text-sm font-medium min-w-[45px] sm:min-w-[40px] text-center">
                                {quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 sm:h-8 sm:w-8 rounded-none hover:bg-gray-100"
                                onClick={() =>
                                  handleIncreaseQuantity(item.id, variant.id)
                                }
                                disabled={quantity >= variant.stock}
                              >
                                <Plus className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                              </Button>
                            </div>
                            <PriceDisplay
                              basePrice={price * quantity}
                              showCode={false}
                              className="text-xs sm:text-sm text-gray-500 whitespace-nowrap"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Delete — Desktop */}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveFromCart(item?.productId)}
                        className="hidden sm:flex flex-shrink-0 h-9 w-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Mobile quantity controls + delete */}
                    <div className="flex items-center justify-between gap-2 pl-0 sm:pl-[104px] lg:pl-[120px]">
                      <div className="flex items-center sm:hidden gap-2 flex-1">
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none hover:bg-gray-100"
                            onClick={() =>
                              handleDecreaseQuantity(item.id, variant.id)
                            }
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="px-3 text-sm font-medium min-w-[45px] text-center">
                            {quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none hover:bg-gray-100"
                            onClick={() =>
                              handleIncreaseQuantity(item.id, variant.id)
                            }
                            disabled={quantity >= variant.stock}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          ${(price * quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Delete — Mobile */}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveFromCart(item?.productId)}
                        className="sm:hidden flex-shrink-0 h-9 w-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Right: Order Summary ── */}
        <div className="w-full lg:w-1/3">
          <Card className="overflow-hidden">
            <div className="px-4 sm:px-6 py-5">
              {/* Coupon */}
              <div className="gap-3 flex flex-col sm:flex-row items-stretch sm:items-center">
                <Input
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="w-full sm:flex-1"
                  disabled={appliedCoupon !== null}
                />
                <Button
                  onClick={handleApplyCoupon}
                  className="bg-blue-primary text-white whitespace-nowrap"
                  disabled={selectedItems.length === 0 || appliedCoupon !== null}
                >
                  {appliedCoupon ? "Coupon Applied" : "Apply coupon"}
                </Button>
              </div>

              {appliedCoupon && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Coupon &quot;{appliedCoupon.code}&quot; applied
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-700 h-auto p-1"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              {/* Summary */}
              <h3 className="text-[#0B0F0E] font-jos text-base sm:text-lg lg:text-[20px] font-semibold mt-6 mb-4">
                Order Summary ({selectedItems.length}{" "}
                {selectedItems.length === 1 ? "item" : "items"})
              </h3>

              {selectedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No items selected</p>
                  <p className="text-xs mt-2">
                    Select items from your cart to see the summary
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Subtotal:</span>
                    <PriceDisplay
                      basePrice={calculateSubtotal()}
                      showCode={false}
                      className="font-medium"
                    />
                  </div>

                  {calculateTotalDiscount() > 0 && (
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Total Discount:</span>
                      <PriceDisplay
                        basePrice={calculateTotalDiscount()}
                        showCode={false}
                        className="text-red-500 font-medium"
                      />
                    </div>
                  )}

                  {calculateTotalCouponDiscount() > 0 && (
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Coupon Discount:</span>
                      <PriceDisplay
                        basePrice={calculateTotalCouponDiscount()}
                        showCode={false}
                        className="text-green-600 font-medium"
                      />
                    </div>
                  )}

                  {/* <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Processing Fee:</span>
                    <PriceDisplay
                      basePrice={calculateTax()}
                      showCode={false}
                      className="font-medium"
                    />
                  </div> */}

                  <Separator className="my-3" />

                  <div className="flex justify-between font-bold text-base sm:text-lg">
                    <span>Total:</span>
                    <PriceDisplay
                      basePrice={calculateTotal()}
                      showCode={false}
                      className="font-medium"
                    />
                  </div>

                  <Button
                    className="w-full bg-blue-primary mt-4"
                    onClick={handlePayment}
                    disabled={selectedItems.length === 0}
                  >
                    Checkout
                  </Button>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-gray-50 mt-4">
              <div className="p-4 sm:p-6">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Sellapy
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Sellapy keeps your information and payment safe
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-4 hidden sm:px-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">
                      Fast Delivery
                    </h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Delivery within 48 hours inside the region</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Inside Dhaka- $20, Outside Dhaka- $30</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Refund if items damaged</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Free shipping (Dhaka, Comilla, Barisal)</span>
                  </li>
                </ul>
              </div>

              <Separator className="mx-4 sm:mx-6" />
              <ShipingPlocey />

              <Separator className="mx-4 sm:mx-6" />
              <div className="px-4 sm:px-6 py-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-gray-700 flex-shrink-0" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">
                    Security and Privacy
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-700">
                  Safe payments and secure personal details
                </p>
              </div>

              <Separator className="mx-4 sm:mx-6" />
            </div>
          </Card>

          <p className="mt-4 text-[#606060] text-xs sm:text-[14px] px-2">
            With popular payment partners, your personal details are safe.
          </p>
        </div>
      </div>

      <div className="lg:my-16 sm:my-10 my-6">
        <h4 className="text-[#0B0F0E] mb-4 sm:text-lg text-base lg:text-[24px] font-semibold leading-[124%]">
          Complementary products
        </h4>
        <ComplementaryProducts />
      </div>

      <div className="lg:mt-16 hidden sm:mt-10 mt-6">
        <FooterSing />
      </div>

      {modalOpen && (
        <PaymentModal orders={orders} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}