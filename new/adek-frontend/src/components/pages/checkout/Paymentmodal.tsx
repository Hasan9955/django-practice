"use client";
import { getCurrencyInfo } from "@/lib/currencies";
import { useCreatePaymentIntentMutation } from "@/redux/features/payment/paymentApi";
import {
  selectConvertedPrice,
  selectCurrentCurrency,
  selectRatesLoaded,
} from "@/redux/features/currency/currencySlice";
import { useAppSelector } from "@/redux/hooks";
import { Select } from "antd";
import { useState, useMemo, useEffect, useCallback } from "react";
import { CURRENCIESAll } from "@/lib/currencies";
import { useGetPlatformDataForUserSupportQuery } from "@/redux/features/banner/bannerSlice";

const apiBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// ─── Types ────────────────────────────────────────────────────────────────────
type DeliveryType = "insideCityRate" | "outsideCityRate" | "freeAreaRate";

export interface OrderItem {
  variantId: string;
  productName: string;
  storeId: string;
  sku: string;
  price: number;
  quantity: number;
}

interface ShippingOption {
  id: string;
  shippingZone: string;
  freeShippingZone: string;
  storeId: string;
  insideCityRate: number;
  outsideCityRate: number;
  freeAreaRate: number;
  isFreeShippingEnabled: boolean; // FIX: was missing — caused free zone to always show
}

type ShippingMap = Record<string, ShippingOption>;

interface PaymentModalProps {
  orders?: OrderItem[];
  onClose: () => void;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const XIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronRight = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const LocationIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="pm-field">
      <label className={`pm-field-label${focused ? " focused" : ""}`}>
        {label}
        {required && <span className="pm-required">*</span>}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`pm-input${focused ? " focused" : ""}`}
        required={required}
      />
    </div>
  );
}

// ─── StepDot ──────────────────────────────────────────────────────────────────
function StepDot({
  active,
  done,
  label,
  num,
}: {
  active: boolean;
  done: boolean;
  label: string;
  num: number;
}) {
  return (
    <div className="pm-step-dot">
      <div
        className={`pm-step-circle${done ? " done" : active ? " active" : ""}`}
      >
        {done ? <CheckIcon /> : num}
      </div>
      <span className={`pm-step-label${active || done ? " active" : ""}`}>
        {label}
      </span>
    </div>
  );
}

// ─── PaymentModal ─────────────────────────────────────────────────────────────
export function PaymentModal({ orders = [], onClose }: PaymentModalProps) {
  const [createPaymentIntent] = useCreatePaymentIntentMutation();

  // ── Currency ──────────────────────────────────────────────────────────────
  const currentCurrency = useAppSelector(selectCurrentCurrency);
  const ratesLoaded = useAppSelector(selectRatesLoaded);
  const displayCurrency = ratesLoaded ? currentCurrency : "USD";

  const { data: platformData } = useGetPlatformDataForUserSupportQuery({});
  // FIX: guard against undefined — was causing NaN in all tax calculations
  const TAX_PERCENTAGE: number = platformData?.result?.commisionRate ?? 0;

  const rate = useAppSelector((state) => selectConvertedPrice(state, 1));

  // ── Component state ───────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<
    "stripe" | "paystack" | null
  >(null);
  const [selectedDeliveryType, setSelectedDeliveryType] =
    useState<DeliveryType>("insideCityRate");

  // FIX: declared before selectedInfo — prevents 'cannot access before initialization'
  const [selectedCurrency, setSelectedCurrency] =
    useState<string>(displayCurrency);

  // FIX: sync selectedCurrency when Redux displayCurrency resolves after mount
  useEffect(() => {
    if (displayCurrency && selectedCurrency !== displayCurrency) {
      setSelectedCurrency(displayCurrency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayCurrency]);

  const selectedInfo = getCurrencyInfo(
    selectedCurrency as keyof typeof CURRENCIESAll,
  );

  const selectedFormatter = useMemo(
    () =>
      new Intl.NumberFormat(selectedInfo.locale, {
        minimumFractionDigits: selectedInfo.decimals,
        maximumFractionDigits: selectedInfo.decimals,
      }),
    [selectedInfo.locale, selectedInfo.decimals],
  );

  /** Format any USD amount using the user's chosen currency */
  const fmt = useCallback(
    (usdAmount: number): string => {
      const converted = ratesLoaded ? usdAmount * rate : usdAmount;
      return `${selectedInfo.symbol}${selectedFormatter.format(converted)}`;
    },
    [ratesLoaded, rate, selectedInfo.symbol, selectedFormatter],
  );

  const [shippingMap, setShippingMap] = useState<ShippingMap>({});
  const [shippingLoading, setShippingLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    deliveryAddress: "",
    city: "",
    zipCode: "",
    state: "",
    country: "",
  });
  const [geoLoading, setGeoLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const uniqueStoreIds = useMemo(
    () => [...new Set(orders.map((o) => o.storeId).filter(Boolean))],
    [orders],
  );

  // ── Fetch shipping for all unique storeIds in parallel ────────────────────
  useEffect(() => {
    if (!uniqueStoreIds.length) return;
    const fetchAllShipping = async () => {
      setShippingLoading(true);
      const results: ShippingMap = {};
      await Promise.all(
        uniqueStoreIds.map(async (storeId) => {
          try {
            const res = await fetch(
              `${apiBaseUrl}/seller-dashboard/get-shipping-options/${storeId}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              },
            );
            const data = await res.json();
            if (data?.success && data?.result?.[0]) {
              // FIX: cast includes isFreeShippingEnabled from API response
              results[storeId] = data.result[0] as ShippingOption;
            }
          } catch (err) {
            console.error(
              `Failed to fetch shipping for store ${storeId}:`,
              err,
            );
          }
        }),
      );
      setShippingMap(results);
      setShippingLoading(false);
    };
    fetchAllShipping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueStoreIds.join(",")]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getItemDeliveryFee = useCallback(
    (storeId: string): number => {
      const opt = shippingMap[storeId];
      if (!opt) return 0;
      // FIX: freeAreaRate may be absent in response — default to 0
      return Number(opt[selectedDeliveryType] ?? 0);
    },
    [shippingMap, selectedDeliveryType],
  );

  const getZoneName = useCallback(
    (storeId: string): string => {
      const opt = shippingMap[storeId];
      if (!opt) return "";
      return selectedDeliveryType === "freeAreaRate"
        ? (opt.freeShippingZone ?? "")
        : (opt.shippingZone ?? "");
    },
    [shippingMap, selectedDeliveryType],
  );

  const totalDeliveryFee = useMemo(
    () =>
      uniqueStoreIds.reduce(
        (sum, storeId) => sum + getItemDeliveryFee(storeId),
        0,
      ),
    [uniqueStoreIds, getItemDeliveryFee],
  );

  const getBreakdown = useCallback(
    (item: OrderItem) => {
      const subtotal = parseFloat((item.price * item.quantity).toFixed(2));
      // FIX: TAX_PERCENTAGE defaults to 0 — was NaN when platformData not yet loaded
      const tax = parseFloat(((subtotal * TAX_PERCENTAGE) / 100).toFixed(2));
      const deliveryFee = getItemDeliveryFee(item.storeId);
      const finalPrice = parseFloat(
        ((subtotal + deliveryFee) / item.quantity).toFixed(2),
      );
      return { subtotal, tax, deliveryFee, finalPrice };
    },
    [TAX_PERCENTAGE, getItemDeliveryFee],
  );

  const ordersWithBreakdown = useMemo(
    () => orders.map((item) => ({ ...item, ...getBreakdown(item) })),
    [orders, getBreakdown],
  );

  const subtotalAll = useMemo(
    () => ordersWithBreakdown.reduce((s, i) => s + i.subtotal, 0),
    [ordersWithBreakdown],
  );

  const taxAll = useMemo(
    () => ordersWithBreakdown.reduce((s, i) => s + i.tax, 0),
    [ordersWithBreakdown],
  );

  const grandTotal = useMemo(
    () => subtotalAll + taxAll + totalDeliveryFee,
    [subtotalAll, taxAll, totalDeliveryFee],
  );

  // ── Shipping select options ───────────────────────────────────────────────
  // FIX: everything computed inside ONE memo — eliminates stale closure bugs
  // that occurred when isFreeShippingAvailable was a separate useMemo and
  // shippingSelectOptions depended on it. Multi-memo chains can read stale
  // values between React's batched memo evaluations. sumRate is also defined
  // inside here so it always captures the fresh shippingMap snapshot.
  const shippingSelectOptions = useMemo(() => {
    const hasShip = Object.keys(shippingMap).length > 0;

    // sumRate defined inside memo — captures fresh shippingMap on every eval
    const sumRate = (
      key: "insideCityRate" | "outsideCityRate" | "freeAreaRate",
    ) =>
      uniqueStoreIds.reduce(
        (s, id) => s + (shippingMap[id]?.[key] ?? 0),
        0,
      );

    // FIX: strict === true check — guards against undefined when shippingMap
    // hasn't loaded yet for a storeId. Only shows free zone when EVERY store
    // in the cart explicitly has isFreeShippingEnabled: true in API response.
    const freeShippingEnabled =
      hasShip &&
      uniqueStoreIds.length > 0 &&
      uniqueStoreIds.every(
        (id) => shippingMap[id]?.isFreeShippingEnabled === true,
      );

    const base: { value: DeliveryType; label: string }[] = [
      {
        value: "insideCityRate",
        label: `Local Delivery${
          hasShip ? ` — ${fmt(sumRate("insideCityRate"))}` : ""
        }`,
      },
      {
        value: "outsideCityRate",
        label: `International Delivery${
          hasShip ? ` — ${fmt(sumRate("outsideCityRate"))}` : ""
        }`,
      },
    ];

    // from the dropdown — user cannot select it.
    if (freeShippingEnabled) {
      base.push({
        value: "freeAreaRate",
        label: `Free Shipping Zone${
          hasShip ? ` — ${fmt(sumRate("freeAreaRate"))}` : ""
        }`,
      });
    }

    return base;
  }, [shippingMap, uniqueStoreIds, fmt]);

  // FIX: used only for the reset effect below — plain derived value (not memo)
  // reads the same source so it stays in sync with shippingSelectOptions
  const isFreeShippingAvailable =
    Object.keys(shippingMap).length > 0 &&
    uniqueStoreIds.length > 0 &&
    uniqueStoreIds.every(
      (id) => shippingMap[id]?.isFreeShippingEnabled === true,
    );

  // FIX: auto-reset selectedDeliveryType when free shipping becomes unavailable
  // e.g. if user had freeAreaRate selected and then cart changes to a store
  // that has isFreeShippingEnabled: false
  useEffect(() => {
    if (!isFreeShippingAvailable && selectedDeliveryType === "freeAreaRate") {
      setSelectedDeliveryType("insideCityRate");
    }
  }, [isFreeShippingAvailable, selectedDeliveryType]);

  // ── Geo auto-fill ─────────────────────────────────────────────────────────
  const handleGeoFill = () => {
    if (!("geolocation" in navigator)) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
          );
          const d = await res.json();
          const a = d.address || {};
          setForm((p) => ({
            ...p,
            city: p.city || a.city || a.town || "",
            zipCode: p.zipCode || a.postcode || "",
            state: p.state || a.state || "",
            country: p.country || a.country || "",
          }));
        } catch {
          // silently ignore geo errors
        }
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ── Checkout ──────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!orders.length) return alert("No items in cart");
    if (!paymentMethod) return alert("Select payment method");
    if (!form.deliveryAddress) return alert("Enter delivery address");

    // FIX: compute currency explicitly — avoids race condition where
    // setSelectedCurrency("usd") wouldn't reflect in same render cycle
    const effectiveCurrency =
      paymentMethod === "paystack" ? "usd" : selectedCurrency.toLowerCase();

    const paymentData = {
      orders: ordersWithBreakdown.map((item) => ({
        storeId: item.storeId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        deliveryFee: item.deliveryFee,
      })),
      currency: effectiveCurrency,
      paymentMethod,
      deliveryAddress: form.deliveryAddress,
      city: form.city,
      region: form.state,
      state: form.state,
      zipCode: form.zipCode,
      taxAmount: taxAll,
    };

    setLoading(true);
    try {
      const response = await createPaymentIntent(paymentData).unwrap();
      if (response.success === true) {
        window.location.href = response.result.checkoutUrl;
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create payment intent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canNext2 = !!(
    form.fullName?.trim() &&
    form.phone?.trim() &&
    form.deliveryAddress?.trim() &&
    form.city?.trim() &&
    form.zipCode?.trim() &&
    form.state?.trim() &&
    form.country?.trim() &&
    selectedDeliveryType
  );

  const deliveryTypeLabel: Record<DeliveryType, string> = {
    insideCityRate: "Local Delivery",
    outsideCityRate: "International Delivery",
    freeAreaRate: "Free Shipping Zone",
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        :root {
          --blue-primary: #2563eb; --blue-hover: #1d4ed8; --blue-light: #eff6ff;
          --blue-text: #1e40af; --surface: #ffffff; --surface-2: #f8fafc;
          --surface-3: #f1f5f9; --border: #e2e8f0; --text-primary: #0f172a;
          --text-secondary: #475569; --text-muted: #94a3b8;
        }
        .pm-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.55); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; animation: pm-fadeIn 0.2s ease; }
        @keyframes pm-fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pm-slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .pm-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; width: 100%; max-width: 880px; max-height: 90vh; overflow-y: auto; animation: pm-slideUp 0.3s cubic-bezier(.22,.68,0,1.15); box-shadow: 0 20px 60px rgba(15,23,42,0.14); }
        .pm-header { padding: 26px 30px 22px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: var(--surface); z-index: 10; }
        .pm-header-title { font-family: 'DM Serif Display', serif; font-size: 21px; color: var(--text-primary); letter-spacing: -0.01em; }
        .pm-header-sub { font-family: 'Sora', sans-serif; font-size: 11.5px; color: var(--text-muted); margin-top: 3px; }
        .pm-close-btn { background: var(--surface-2); border: 1px solid var(--border); border-radius: 9px; padding: 7px; cursor: pointer; color: var(--text-secondary); }
        .pm-close-btn:hover { background: var(--surface-3); color: var(--text-primary); }
        .pm-body { padding: 26px 30px 30px; }
        .pm-steps { display: flex; align-items: flex-start; margin-bottom: 30px; }
        .pm-step-dot { display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .pm-step-circle { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--border); color: var(--text-muted); font-size: 12px; font-weight: 700; background: white; }
        .pm-step-circle.active { border-color: var(--blue-primary); color: var(--blue-primary); background: var(--blue-light); }
        .pm-step-circle.done { background: var(--blue-primary); border-color: var(--blue-primary); color: white; }
        .pm-step-label { font-family: 'Sora', sans-serif; font-size: 9.5px; font-weight: 600; color: var(--text-muted); }
        .pm-step-label.active { color: var(--blue-primary); }
        .pm-step-line { flex: 1; height: 1.5px; background: var(--border); margin: 0 8px; margin-bottom: 24px; }
        .pm-step-line.done { background: var(--blue-primary); }
        .pm-layout { display: flex; gap: 24px; flex-wrap: wrap; }
        .pm-left { flex: 1 1 320px; display: flex; flex-direction: column; gap: 18px; }
        .pm-right { flex: 0 0 272px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 16px; padding: 18px; align-self: flex-start; }
        .pm-desc { font-family: 'Sora', sans-serif; font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
        .pm-methods { display: flex; gap: 12px; flex-wrap: wrap; }
        .pm-method { flex: 1; min-width: 140px; border: 1.5px solid var(--border); border-radius: 14px; padding: 18px; cursor: pointer; transition: all 0.2s; background: var(--surface-2); }
        .pm-method:hover { border-color: var(--blue-primary); background: var(--blue-light); }
        .pm-method.active { border-color: var(--blue-primary); background: var(--blue-light); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
        .pm-method-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .pm-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border); background: white; display: flex; align-items: center; justify-content: center; }
        .pm-radio.checked { border-color: var(--blue-primary); background: var(--blue-primary); }
        .pm-method-desc { font-family: 'Sora',sans-serif; font-size: 11.5px; color: var(--text-muted); margin-bottom: 8px; }
        .pm-badge { display: inline-flex; font-family: 'Sora',sans-serif; font-size: 9.5px; font-weight: 600; padding: 2px 8px; border-radius: 99px; letter-spacing: 0.06em; }
        .pm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pm-field { display: flex; flex-direction: column; gap: 5px; }
        .pm-field-label { font-family: 'Sora',sans-serif; font-size: 10.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); }
        .pm-field-label.focused { color: var(--blue-primary); }
        .pm-required { color: #ef4444; margin-left: 3px; }
        .pm-input { background: white; border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 13px; color: var(--text-primary); font-size: 13px; font-family: 'Sora', sans-serif; outline: none; width: 100%; box-sizing: border-box; transition: all 0.15s; }
        .pm-input:focus { border-color: var(--blue-primary); background: var(--blue-light); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .pm-address-header { display: flex; justify-content: space-between; align-items: center; }
        .pm-geo-btn { background: white; border: 1.5px solid rgba(37,99,235,0.3); border-radius: 8px; padding: 5px 11px; color: var(--blue-primary); font-family: 'Sora',sans-serif; font-size: 10.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; }
        .pm-review-box { background: var(--surface-2); border: 1px solid var(--border); border-radius: 13px; padding: 14px 16px; }
        .pm-review-box.highlight { border-color: #bfdbfe; background: var(--blue-light); }
        .pm-review-label { font-family: 'Sora',sans-serif; font-size: 9.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 7px; }
        .pm-review-value { font-family: 'Sora',sans-serif; font-size: 14px; font-weight: 600; color: var(--blue-text); }
        .pm-review-address { font-family: 'Sora',sans-serif; font-size: 13px; color: var(--text-secondary); line-height: 1.65; }
        .pm-review-name { font-family: 'Sora',sans-serif; font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 3px; }
        .pm-change-btn { background: transparent; border: none; color: var(--text-muted); font-family: 'Sora',sans-serif; font-size: 11px; cursor: pointer; margin-top: 8px; text-decoration: underline; }
        .pm-summary-title { font-family: 'DM Serif Display',serif; font-size: 16px; color: var(--text-primary); margin-bottom: 12px; }
        .pm-order-item { background: white; border: 1px solid var(--border); border-radius: 12px; padding: 14px; margin-bottom: 10px; }
        .pm-item-name { font-family: 'Sora',sans-serif; font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
        .pm-item-sku { font-family: 'Sora',sans-serif; font-size: 10.5px; color: var(--text-muted); margin-bottom: 6px; }
        .pm-price-row { display: flex; justify-content: space-between; font-family: 'Sora',sans-serif; font-size: 11px; color: var(--text-secondary); padding: 1.5px 0; }
        .pm-price-row.delivery { color: var(--blue-primary); font-weight: 600; }
        .pm-item-total { display: flex; justify-content: space-between; padding-top: 6px; margin-top: 5px; border-top: 1px solid var(--border); font-weight: 700; color: var(--blue-text); font-family: 'Sora',sans-serif; font-size: 12px; }
        .pm-grand-total { display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid #bfdbfe; font-size: 19px; font-weight: 700; color: var(--blue-text); font-family: 'Sora',sans-serif; }
        .pm-total-section { margin-top: 10px; border-top: 1px dashed var(--border); padding-top: 10px; }
        .pm-total-row { display: flex; justify-content: space-between; font-family: 'Sora',sans-serif; font-size: 11.5px; color: var(--text-secondary); padding: 2px 0; }
        .pm-total-row.delivery-total { color: var(--blue-primary); font-weight: 600; }
        .pm-shipping-loading { font-family: 'Sora',sans-serif; font-size: 11px; color: var(--text-muted); padding: 8px; text-align: center; }
        .pm-nav { display: flex; justify-content: space-between; margin-top: 26px; padding-top: 22px; border-top: 1px solid var(--border); }
        .pm-btn-primary { background: var(--blue-primary); color: white; border: none; cursor: pointer; font-family: 'Sora',sans-serif; font-weight: 700; font-size: 13px; border-radius: 11px; padding: 11px 22px; display: flex; align-items: center; gap: 7px; }
        .pm-btn-primary:hover:not(:disabled) { background: var(--blue-hover); }
        .pm-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
        .pm-btn-ghost { background: white; color: var(--text-secondary); border: 1.5px solid var(--border); cursor: pointer; font-family: 'Sora',sans-serif; font-weight: 500; font-size: 13px; border-radius: 11px; padding: 11px 18px; }
      `}</style>

      <div
        className="pm-overlay"
        onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
      >
        <div className="pm-card">
          {/* ── Header ── */}
          <div className="pm-header">
            <div>
              <div className="pm-header-title">Checkout</div>
              <div className="pm-header-sub">
                Secure payment • {orders.length} item{orders.length !== 1 ? "s" : ""}
              </div>
            </div>
            <button
              className="pm-close-btn"
              onClick={() => !loading && onClose()}
              aria-label="Close"
            >
              <XIcon />
            </button>
          </div>

          <div className="pm-body">
            {/* ── Steps ── */}
            <div className="pm-steps">
              <StepDot num={1} label="Method" active={step === 1} done={step > 1} />
              <div className={`pm-step-line${step > 1 ? " done" : ""}`} />
              <StepDot num={2} label="Address" active={step === 2} done={step > 2} />
              <div className={`pm-step-line${step > 2 ? " done" : ""}`} />
              <StepDot num={3} label="Review" active={step === 3} done={false} />
            </div>

            <div className="pm-layout">
              {/* ── LEFT ── */}
              <div className="pm-left">

                {/* STEP 1 — Payment method */}
                {step === 1 && (
                  <>
                    <p className="pm-desc">
                      Select how you&#39;d like to complete your payment.
                    </p>
                    <div className="pm-methods">
                      {[
                        {
                          id: "paystack" as const,
                          desc: "Recommended for Africa & Nigeria",
                          badge: "NG · GH · KE",
                          badgeBg: "rgba(0,195,247,0.1)",
                          badgeBorder: "rgba(0,195,247,0.3)",
                          badgeColor: "#38bdf8",
                          logo: (
                            <svg viewBox="0 0 120 38" width="88" height="28">
                              <rect x="0" y="9" width="11" height="8" rx="2" fill="#00c3f7" />
                              <rect x="0" y="21" width="11" height="8" rx="2" fill="#00c3f7" opacity="0.45" />
                              <text x="17" y="24" fill="#0ea5e9" fontSize="13" fontWeight="700" fontFamily="sans-serif">paystack</text>
                            </svg>
                          ),
                        },
                        {
                          id: "stripe" as const,
                          desc: "US, UK & Worldwide",
                          badge: "USD · EUR · GBP",
                          badgeBg: "rgba(99,91,255,0.1)",
                          badgeBorder: "rgba(99,91,255,0.35)",
                          badgeColor: "#a5b4fc",
                          logo: (
                            <svg viewBox="0 0 72 28" width="72" height="28">
                              <text x="0" y="21" fill="#4f46e5" fontSize="18" fontWeight="700" fontFamily="sans-serif">stripe</text>
                            </svg>
                          ),
                        },
                      ].map((m) => (
                        <div
                          key={m.id}
                          className={`pm-method${paymentMethod === m.id ? " active" : ""}`}
                          onClick={() => setPaymentMethod(m.id)}
                        >
                          <div className="pm-method-header">
                            {m.logo}
                            <div className={`pm-radio${paymentMethod === m.id ? " checked" : ""}`}>
                              {paymentMethod === m.id && <CheckIcon />}
                            </div>
                          </div>
                          <div className="pm-method-desc">{m.desc}</div>
                          <span
                            className="pm-badge"
                            style={{
                              background: m.badgeBg,
                              border: `1px solid ${m.badgeBorder}`,
                              color: m.badgeColor,
                            }}
                          >
                            {m.badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* STEP 2 — Address + delivery method */}
                {step === 2 && (
                  <>
                    <div className="pm-address-header">
                      <span className="pm-desc">
                        Where should we deliver your order?
                      </span>
                      <button className="pm-geo-btn" onClick={handleGeoFill}>
                        {geoLoading ? "Detecting…" : "Auto-fill"}{" "}
                        <LocationIcon />
                      </button>
                    </div>
                    <div className="pm-grid">
                      <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" required />
                      <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+880 1XXX-XXXXXX" required />
                      <Field label="City" name="city" value={form.city} onChange={handleChange} placeholder="Dhaka" required />
                      <Field label="ZIP / Postal Code" name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="1200" required />
                      <Field label="State / Province" name="state" value={form.state} onChange={handleChange} placeholder="Dhaka Division" required />
                      <Field label="Country" name="country" value={form.country} onChange={handleChange} placeholder="Bangladesh" required />

                      <div style={{ gridColumn: "1 / -1" }}>
                        <Field
                          label="Full Delivery Address"
                          name="deliveryAddress"
                          value={form.deliveryAddress}
                          onChange={handleChange}
                          placeholder="House 45, Road 12, Gulshan"
                          required
                        />
                      </div>

                      {/* Currency select */}
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label
                          className="pm-field-label"
                          style={{ display: "block", marginBottom: 5 }}
                        >
                          Payment Currency{" "}
                          <span className="pm-required">*</span>
                        </label>
                        <Select
                          showSearch
                          value={selectedCurrency}
                          disabled
                          onChange={(value) => setSelectedCurrency(value)}
                          style={{ width: "100%", height: "40px" }}
                          placeholder="Select currency"
                          optionFilterProp="label"
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={Object.values(CURRENCIESAll).map((c) => ({
                            value: c.code,
                            label: `${c.flag}  ${c.code} — ${c.name}`,
                          }))}
                        />
                      </div>

                      {/* Delivery Method dropdown */}
                      {/* FIX: Free Shipping Zone option is conditionally hidden.
                          When API returns "isFreeShippingEnabled": false for any
                          store in the cart, the freeAreaRate option is excluded
                          from shippingSelectOptions entirely. The Select dropdown
                          will only show Local Delivery and International Delivery. */}
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label
                          className="pm-field-label"
                          style={{ display: "block", marginBottom: 5 }}
                        >
                          Delivery Method <span className="pm-required">*</span>
                        </label>
                        {shippingLoading ? (
                          <div className="pm-shipping-loading">
                            Loading shipping options…
                          </div>
                        ) : (
                          <Select
                            value={selectedDeliveryType}
                            onChange={(value) =>
                              setSelectedDeliveryType(value as DeliveryType)
                            }
                            style={{ width: "100%", height: "40px" }}
                            placeholder="Select delivery zone"
                            options={shippingSelectOptions}
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 3 — Review */}
                {step === 3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="pm-review-box highlight">
                      <div className="pm-review-label">Payment via</div>
                      <div className="pm-review-value">
                        {paymentMethod === "stripe" ? "Stripe" : "Paystack"}
                      </div>
                      <button
                        className="pm-change-btn"
                        onClick={() => setStep(1)}
                      >
                        Change
                      </button>
                    </div>
                    <div className="pm-review-box">
                      <div className="pm-review-label">Delivering to</div>
                      <div className="pm-review-name">{form.fullName}</div>
                      <div className="pm-review-address">
                        {form.deliveryAddress}
                        <br />
                        {[form.city, form.state, form.zipCode]
                          .filter(Boolean)
                          .join(", ")}
                        <br />
                        {form.country}
                      </div>
                      <button
                        className="pm-change-btn"
                        onClick={() => setStep(2)}
                      >
                        Edit address
                      </button>
                    </div>
                    <div className="pm-review-box">
                      <div className="pm-review-label">Delivery Type</div>
                      <div className="pm-review-value" style={{ fontSize: 13 }}>
                        {deliveryTypeLabel[selectedDeliveryType]}
                      </div>
                    </div>
                    <div className="pm-review-box">
                      <div className="pm-review-label">Payment Currency</div>
                      <div className="pm-review-value" style={{ fontSize: 13 }}>
                        {CURRENCIESAll[selectedCurrency as keyof typeof CURRENCIESAll]?.flag}{" "}
                        {selectedCurrency} —{" "}
                        {CURRENCIESAll[selectedCurrency as keyof typeof CURRENCIESAll]?.name}
                      </div>
                      <button
                        className="pm-change-btn"
                        onClick={() => setStep(2)}
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT: Order Summary ── */}
              <div className="pm-right">
                <div className="pm-summary-title">Your Order</div>

                {ordersWithBreakdown.length === 0 ? (
                  <div
                    style={{
                      color: "var(--text-muted)",
                      textAlign: "center",
                      padding: "22px 0",
                    }}
                  >
                    Cart is empty
                  </div>
                ) : (
                  <>
                    {ordersWithBreakdown.map((item) => {
                      const zoneName = getZoneName(item.storeId);
                      return (
                        <div key={item.variantId} className="pm-order-item">
                          <div className="pm-item-name">{item.productName}</div>
                          <div className="pm-item-sku">SKU: {item.sku}</div>
                          <div className="pm-price-row">
                            <span>
                              Subtotal ({item.quantity}×{fmt(item.price)})
                            </span>
                            <span>{fmt(item.subtotal)}</span>
                          </div>
                          <div className="pm-price-row delivery">
                            <span>
                              Delivery ({deliveryTypeLabel[selectedDeliveryType]})
                              {zoneName ? ` · ${zoneName}` : ""}
                            </span>
                            <span>
                              {shippingLoading ? "…" : fmt(item.deliveryFee)}
                            </span>
                          </div>
                          <div className="pm-item-total">
                            <span>Item Total</span>
                            <span>{fmt(item.finalPrice * item.quantity)}</span>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pm-total-section">
                      <div className="pm-total-row">
                        <span>Subtotal</span>
                        <span>{fmt(subtotalAll)}</span>
                      </div>
                      <div className="pm-total-row">
                        <span>Processing Fee</span>
                        <span>{fmt(taxAll)}</span>
                      </div>
                      <div className="pm-total-row delivery-total">
                        <span>Delivery Fee (All Stores)</span>
                        <span>{fmt(totalDeliveryFee)}</span>
                      </div>
                    </div>
                  </>
                )}

                {ordersWithBreakdown.length > 0 && (
                  <div className="pm-grand-total" style={{ marginTop: 10 }}>
                    <span>Total</span>
                    <span>{fmt(grandTotal)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Nav buttons ── */}
            <div className="pm-nav">
              {step > 1 && (
                <button
                  className="pm-btn-ghost"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                  disabled={loading}
                >
                  ← Back
                </button>
              )}
              {step < 3 ? (
                <button
                  className="pm-btn-primary"
                  style={{ marginLeft: "auto" }}
                  onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                  disabled={step === 1 ? !paymentMethod : !canNext2}
                >
                  Continue <ChevronRight />
                </button>
              ) : (
                <button
                  className="pm-btn-primary"
                  style={{ marginLeft: "auto" }}
                  onClick={handleCheckout}
                  disabled={loading || orders.length === 0}
                >
                  {loading ? "Processing…" : `Pay ${fmt(grandTotal)}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}