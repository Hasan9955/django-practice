/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/Button/Button";
import { Label } from "@/components/ui/Label/label";
import { useGetPlatformDataForUserSupportQuery } from "@/redux/features/banner/bannerSlice";
import {
  resetOrder,
  selectOrder,
  setCity,
  setDeliveryAddress,
  setPaymentMethod,
  setState,
  setRegion,
  setZipCode,
  setFullName,
  setPhone,
  setCountry,
  removeOrderItem,
} from "@/redux/features/payment/orderSlice";
import { useCreatePaymentIntentMutation } from "@/redux/features/payment/paymentApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Input } from "antd";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function PaymentForm() {
  const [selected, setSelected] = useState<"stripe" | "paystack" | null>(null);
  const orderState = useAppSelector(selectOrder);
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const dispatch = useAppDispatch();
  const [geoRegion, setGeoRegion] = useState<string | null>(null);
  const [allInfo, setAllInfo] = useState<any | null>(null);
  const [continent, setContinent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: platformData } = useGetPlatformDataForUserSupportQuery({});
  console.log(error);

  // FIX 1: Preserve item.price as the unit price — do NOT overwrite it with finalPrice.
  // finalPrice is set to 0 here and recalculated by the useEffect below.
  const [orders, setOrders] = useState(
    (orderState.orders || []).map((item) => ({
      ...item,
      finalPrice: 0,
    })),
  );


  const newOrders = useMemo(
    () =>
      orders.map((item) => ({
        productName: item.productName,
        storeId: item.storeId,
        variantId: item.variantId,
        price: item.finalPrice,
        quantity: item.quantity,
        name: item.name,
      })),
    [orders],
  );

  const platformDataResult = platformData?.result;
  // FIX 2: Default commission rate should be 10 (i.e. 10%), not 0.1 (which would be 0.1%).
  const commissionRate = platformDataResult?.commisionRate ?? 10;

  // ─── Geolocation ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const geoData = await geoRes.json();
          const countryName = geoData.address?.country;
          const displayRegion =
            geoData.address?.state ||
            geoData.address?.state_district ||
            geoData.address?.county ||
            geoData.address?.city ||
            countryName;

          setAllInfo(geoData.address);
          setGeoRegion(displayRegion);

          if (countryName) {
            const countryRes = await fetch(
              `https://restcountries.com/v3.1/name/${encodeURIComponent(
                countryName,
              )}?fullText=true`,
            );
            if (!countryRes.ok) throw new Error("Failed to fetch country info");
            const countryData = await countryRes.json();
            setContinent(countryData?.[0]?.region || "Unknown");
          } else {
            setContinent("Unknown");
          }
        } catch (err: any) {
          console.error(err);
          setError("Failed to fetch location or continent data.");
        }
      },
      (err) => setError(err.message),
    );
  }, []);

  // ─── Auto-fill Redux from geolocation ────────────────────────────────────────
  useEffect(() => {
    if (geoRegion && continent) dispatch(setRegion(continent));
    if (allInfo?.city) dispatch(setCity(allInfo.city));
    if (allInfo?.postcode) dispatch(setZipCode(allInfo.postcode));
  }, [geoRegion, continent, allInfo, dispatch]);
  const getItemBreakdown = (item: (typeof orders)[0]) => {
    const subtotal = item.price * item.quantity;
    // FIX 3: Delivery and tax are based on subtotal, not just the unit price,
    // so they scale correctly when the user changes the quantity.
    const delivery = parseFloat(((subtotal * 5) / 100).toFixed(2));
    const tax = parseFloat(((subtotal * commissionRate) / 100).toFixed(2));
    const finalPrice = parseFloat((subtotal + delivery + tax).toFixed(2));
    return { subtotal, delivery, tax, finalPrice };
  };

  // ─── Recalculate finalPrice whenever quantity or commissionRate changes ────────
  useEffect(() => {
    setOrders((prev) =>
      prev.map((item) => {
        const { finalPrice } = getItemBreakdown(item);
        return { ...item, finalPrice };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.map((o) => o.quantity).join(","), commissionRate]);

  // Grand total — single source of truth
  const total = orders.reduce((sum, item) => sum + (item.finalPrice ?? 0), 0);

  const handleRemoveItem = (variantId: string) => {
    dispatch(removeOrderItem(variantId));
    setOrders((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  // ─── Payment method ───────────────────────────────────────────────────────────
  const handleSelect = (method: "stripe" | "paystack") => {
    setSelected(method);
    dispatch(setPaymentMethod(method));
  };

  // ─── Input changes ────────────────────────────────────────────────────────────
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const actions: Record<string, (v: string) => any> = {
      fullName: setFullName,
      phone: setPhone,
      deliveryAddress: setDeliveryAddress,
      state: setState,
      city: setCity,
      zipCode: setZipCode,
      country: setCountry,
    };
    if (actions[name]) dispatch(actions[name](value));
  };

  // ─── Checkout ─────────────────────────────────────────────────────────────────
  const handleCheckOut = async () => {
    if (!orders.length) return alert("No items in cart");
    if (!orderState.paymentMethod) return alert("Select payment method");
    if (!orderState.deliveryAddress) return alert("Enter delivery address");

    const paymentData = {
      orders: newOrders,
      currency: orderState.currency,
      paymentMethod: orderState.paymentMethod,
      deliveryAddress: orderState.deliveryAddress,
      city: orderState.city,
      region: orderState.region,
      state: orderState.region,
      zipCode: orderState.zipCode,
    };

    try {
      const response = await createPaymentIntent(paymentData).unwrap();
      if (response.success === true) {
        dispatch(resetOrder());
        window.location.href = response.result.checkoutUrl;
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create payment intent");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 md:p-8 border border-gray-300 rounded-lg shadow-sm flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* ── Left: Payment method + Address form ── */}
        <div className="w-full lg:w-3/5 flex flex-col gap-6">
          {/* Payment Methods */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Select Payment Method
            </h2>
            <div className="flex flex-row gap-4 md:gap-6 flex-wrap">
              {(["paystack", "stripe"] as const).map((method) => (
                <div
                  key={method}
                  onClick={() => handleSelect(method)}
                  className={`cursor-pointer border-2 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center transition-all duration-300 ${
                    selected === method
                      ? "border-blue-500 scale-105 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 hover:scale-105"
                  }`}
                >
                  <p
                    className={`text-[8px] md:text-[10px] font-medium font-nun text-wrap ${
                      method === "paystack"
                        ? "text-red-600"
                        : "text-blue-primary"
                    }`}
                  >
                    {method === "paystack"
                      ? "Use Paystack for payment in Africa (Nigeria)"
                      : "Use Stripe for payment in US, UK and Worldwide"}
                  </p>
                  <Image
                    src={
                      method === "paystack" ? "/paystack.svg" : "/stripe-ar.svg"
                    }
                    alt={method}
                    width={100}
                    height={100}
                    className="sm:w-16 h-8 w-16 sm:h-10 md:w-32 md:h-12"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Address Form */}
          <div className="flex p-3 rounded-xl border border-blue-100 flex-col gap-4 sm:gap-6">
            <Label>Delivery Address</Label>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {[
                {
                  label: "Full Name",
                  name: "fullName",
                  placeholder: "Name",
                  value: orderState.fullName || "",
                },
                {
                  label: "Phone Number",
                  name: "phone",
                  placeholder: "Phone",
                  value: orderState.phone || "",
                },
              ].map(({ label, name, placeholder, value }) => (
                <div key={name} className="flex flex-col gap-2 w-full">
                  <Label className="text-gray-700">{label}</Label>
                  <Input
                    name={name}
                    placeholder={placeholder}
                    allowClear
                    value={value}
                    onChange={onChange}
                    className="py-2 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {[
                {
                  label: "City",
                  name: "city",
                  value: orderState.city || allInfo?.city || "",
                },
                {
                  label: "Post/ZIP Code",
                  name: "zipCode",
                  value: orderState.zipCode || allInfo?.postcode || "",
                },
              ].map(({ label, name, value }) => (
                <div key={name} className="flex flex-col gap-2 w-full">
                  <Label className="text-gray-700">{label}</Label>
                  <Input
                    name={name}
                    placeholder={label}
                    allowClear
                    value={value}
                    onChange={onChange}
                    className="py-2 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {[
                {
                  label: "State",
                  name: "state",
                  value: orderState.state || allInfo?.state || "",
                },
                {
                  label: "Country",
                  name: "country",
                  value: orderState.country || allInfo?.country || "",
                },
              ].map(({ label, name, value }) => (
                <div key={name} className="flex flex-col gap-2 w-full">
                  <Label className="text-gray-700">{label}</Label>
                  <Input
                    name={name}
                    placeholder={label}
                    allowClear
                    value={value}
                    onChange={onChange}
                    className="py-2 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 w-full">
              <Label className="text-gray-700">Delivery Address</Label>
              <Input
                required
                name="deliveryAddress"
                placeholder="First Line of Address"
                allowClear
                value={orderState.deliveryAddress || ""}
                onChange={onChange}
                className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="w-full lg:w-2/5 flex justify-center">
          <div className="rounded-xl border p-4 sm:p-6 border-[#E4E9EE] bg-white w-full max-w-[400px] flex flex-col gap-4">
            <h4 className="text-[#0B0F0E] font-semibold text-[20px] md:text-[22px]">
              Product Summary
            </h4>

            {orders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Your cart is empty.
              </p>
            ) : (
              <>
                {orders.map((item, idx) => {
                  const { subtotal, delivery, tax, finalPrice } =
                    getItemBreakdown(item);
                  return (
                    <div
                      key={idx}
                      className="flex flex-col gap-2 pb-4 border-b border-[#E4E9EE] last:border-none"
                    >
                      {/* Product header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm text-[#0B0F0E]">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-400">
                            SKU: {item.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.variantId)}
                          className="text-xs text-red-400 hover:underline ml-2 shrink-0"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Cost breakdown */}
                      <div className="flex flex-col gap-1 text-sm text-gray-500">
                        <div className="flex justify-between">
                          <span>
                            Subtotal ({item.quantity} × ${item.price.toFixed(2)}
                            )
                          </span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery (5%)</span>
                          <span>${delivery.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax ({commissionRate}%)</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between font-semibold text-[#0B0F0E] text-sm pt-1">
                        <span>Item Total</span>
                        <span>${finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Grand Total */}
                <div className="flex justify-between items-center text-[18px] md:text-[20px] font-semibold text-[#0B0F0E] pt-2 border-t border-[#E4E9EE]">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        className="bg-blue-primary hover:bg-blue-600 text-white py-3 px-6 rounded-lg w-full sm:w-auto"
        onClick={handleCheckOut}
      >
        Checkout
      </Button>
    </div>
  );
}
