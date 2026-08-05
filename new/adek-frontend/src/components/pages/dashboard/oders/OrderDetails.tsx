/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useGetOrderDetailsQuery } from "@/redux/features/dashborad/sellerdashboard/sellerDashboardApi";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderItem {
  srNo: string;
  productTitle: string;
  itemPrice: number;
  quantity: number;
  amount: number;
}

interface InvoiceItem {
  id: string;
  orderNumber: string;
  productId: string | null;
  productName: string | null;
  productPhoto: string[];
  variantId: string | null;
  sku: string | null;
  bundle: string | null;
  unitPrice: number;
  quantity: number;
  itemSubtotal: number;
  deliveryFee: number;
}

interface InvoiceSummary {
  subtotal: number;
  deliveryFee: number;
  processingFee: number;
  totalPayment: number;
}

interface Invoice {
  invoiceNumber: string;
  paymentId: string;
  paymentDate: string;
  currency: string;
  items: InvoiceItem[];
  summary: InvoiceSummary;
}

interface OrderDetails {
  srNo: string;
  date: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  region: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  deliveryAddress: string;
  items: OrderItem[];
  shippingCost: number;
  discount: number;
  status: string;
  paymentStatus: string;
  invoice: Invoice | null;
}

// ─── Invoice Print/PDF Template ───────────────────────────────────────────────
function InvoiceTemplate({
  order,
  invoiceRef,
}: {
  order: OrderDetails;
  invoiceRef: React.RefObject<HTMLDivElement | null>;
}) {
  const invoice = order.invoice;
  const summary = invoice?.summary;
  const subtotal = summary?.subtotal ?? order.items.reduce((s, i) => s + i.amount, 0);
  const deliveryFee = summary?.deliveryFee ?? order.shippingCost;
  const processingFee = summary?.processingFee ?? 0;
  const total = summary?.totalPayment ?? subtotal + deliveryFee + processingFee - order.discount;
  const items = invoice?.items ?? order.items;

  return (
    <div
      ref={invoiceRef}
      id="invoice-template"
      style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#fff", color: "#111" }}
      className="w-full max-w-[800px] mx-auto p-8 bg-white"
    >
      {/* Top Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FF914D] tracking-tight">INVOICE</h1>
          <p className="text-sm text-gray-500 mt-1">#{invoice?.invoiceNumber ?? order.orderId}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs text-gray-500">Payment Date</p>
          <p className="text-sm font-semibold text-gray-800">
            {invoice?.paymentDate
              ? new Date(invoice.paymentDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : order.date}
          </p>
          <p className="text-xs text-gray-500 mt-1">Order Date</p>
          <p className="text-sm font-semibold text-gray-800">{order.date}</p>
          <span
            className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold ${
              order.paymentStatus === "Paid"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-[#FF914D] mb-6" />

      {/* Bill To / Order Info */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
          <p className="text-sm font-bold text-gray-800">{order.customerName}</p>
          <p className="text-xs text-gray-600">{order.customerEmail}</p>
          <p className="text-xs text-gray-600">{order.customerPhone}</p>
          <div className="mt-2 text-xs text-gray-600 space-y-0.5">
            <p>{order.deliveryAddress}</p>
            <p>
              {[order.city, order.state, order.country].filter((v) => v && v !== "N/A").join(", ")}
            </p>
            {order.zipCode && order.zipCode !== "N/A" && <p>ZIP: {order.zipCode}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            Order Info
          </p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>
              <span className="font-semibold text-gray-700">Order ID:</span>{" "}
              <span className="break-all">{order.orderId}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-700">Order No.:</span> {order.srNo}
            </p>
            {invoice?.paymentId && (
              <p>
                <span className="font-semibold text-gray-700">Payment ID:</span>{" "}
                <span className="break-all">{invoice.paymentId}</span>
              </p>
            )}
            <p>
              <span className="font-semibold text-gray-700">Currency:</span>{" "}
              {invoice?.currency ?? "USD"}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Status:</span> {order.status}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm mb-6 border-collapse">
        <thead>
          <tr style={{ backgroundColor: "#FF914D" }}>
            <th className="text-left text-white py-2 px-3 text-xs font-semibold rounded-tl">#</th>
            <th className="text-left text-white py-2 px-3 text-xs font-semibold">Order No.</th>
            <th className="text-left text-white py-2 px-3 text-xs font-semibold">Product</th>
            <th className="text-left text-white py-2 px-3 text-xs font-semibold">SKU</th>
            <th className="text-right text-white py-2 px-3 text-xs font-semibold">Unit Price</th>
            <th className="text-right text-white py-2 px-3 text-xs font-semibold">Qty</th>
            <th className="text-right text-white py-2 px-3 text-xs font-semibold rounded-tr">
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, index: number) => (
            <tr
              key={item.id ?? index}
              style={{ backgroundColor: index % 2 === 0 ? "#fff7f2" : "#ffffff" }}
            >
              <td className="py-2 px-3 text-xs text-gray-600">
                {String(index + 1).padStart(2, "0")}
              </td>
              <td className="py-2 px-3 text-xs text-gray-700 font-medium">
                {item.orderNumber ?? order.srNo}
              </td>
              <td className="py-2 px-3 text-xs text-gray-800 font-medium">
                {item.productName ?? order.items[index]?.productTitle ?? "—"}
              </td>
              <td className="py-2 px-3 text-xs text-gray-500 font-mono">{item.sku ?? "—"}</td>
              <td className="py-2 px-3 text-xs text-gray-800 text-right">
                ${(item.unitPrice ?? order.items[index]?.itemPrice ?? 0).toFixed(2)}
              </td>
              <td className="py-2 px-3 text-xs text-gray-800 text-right">
                {String(item.quantity ?? order.items[index]?.quantity ?? 1).padStart(2, "0")}
              </td>
              <td className="py-2 px-3 text-xs text-gray-800 text-right font-semibold">
                ${(item.itemSubtotal ?? order.items[index]?.amount ?? 0).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Delivery Fee</span>
            {deliveryFee === 0 ? (
              <span className="text-green-600 font-medium">Free</span>
            ) : (
              <span>+${deliveryFee.toFixed(2)}</span>
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Processing Fee</span>
            {processingFee === 0 ? (
              <span className="text-green-600 font-medium">Free</span>
            ) : (
              <span>+${processingFee.toFixed(2)}</span>
            )}
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-xs text-green-600">
              <span>Discount</span>
              <span>-${order.discount.toFixed(2)}</span>
            </div>
          )}
          <div
            className="flex justify-between pt-2 border-t-2 border-[#FF914D] text-sm font-bold"
          >
            <span className="text-gray-800">Total</span>
            <span className="text-[#FF914D]">
              ${total.toFixed(2)}{" "}
              <span className="text-xs font-medium text-gray-400">
                {invoice?.currency ?? "USD"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>Thank you for your order! For any questions, contact us at support@yourstore.com</p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function OrderDetails({ orderId }: { orderId: string }) {
  const { data, error, isLoading } = useGetOrderDetailsQuery(orderId);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const order = useMemo<OrderDetails | null>(() => {
    if (!data?.result) return null;
    const result = data.result;
    return {
      srNo: result.orderNumber || "N/A",
      date: new Date(result.createdAt)
        .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
        .replace(/\//g, ". "),
      orderId: result.id || "N/A",
      customerName: result.user?.fullName || "N/A",
      customerEmail: result.user?.email || "N/A",
      customerPhone: result.user?.phoneNumber || result.phoneNumber || "N/A",
      region: result.deliveryDetails?.region || result.region || "N/A",
      country: result.deliveryDetails?.country || result.country || "N/A",
      state: result.deliveryDetails?.state || result.state || "N/A",
      city: result.deliveryDetails?.city || result.city || "N/A",
      zipCode: result.deliveryDetails?.zipCode || result.zipCode || "N/A",
      deliveryAddress:
        result.deliveryDetails?.deliveryAddress || result.deliveryAddress || "N/A",
      items: [
        {
          srNo: "1",
          productTitle: result.variant?.product?.productName || "Unknown Product",
          itemPrice: result.price || 0,
          quantity: result.quantity || 1,
          amount: (result.price || 0) * (result.quantity || 1),
        },
      ],
      shippingCost: result.deliveryFee || 0,
      discount: 0,
      status: result.orderStatus || "Pending",
      paymentStatus: result.payment?.status || "Pending",
      invoice: result.invoice || null,
    };
  }, [data]);

  // ── Print ──
  const handlePrint = () => {
    const content = document.getElementById("invoice-template");
    if (!content) return;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order?.srNo ?? ""}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { margin: 0; padding: 24px; font-family: Arial, sans-serif; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // ── Download PDF ──
  const handleDownloadPDF = async () => {
    const content = document.getElementById("invoice-template");
    if (!content) return;
    setPdfLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${order?.srNo ?? "order"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-8 md:space-y-10">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
            <Skeleton className="w-16 md:w-20 h-5 md:h-6 rounded" />
          </div>
          <Skeleton className="w-48 sm:w-64 h-8 sm:h-10 md:h-12 rounded" />
        </div>
        <div className="relative mb-12 md:mb-20">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 md:gap-3">
                <Skeleton className="w-5 h-5 md:w-7 md:h-7 rounded-full" />
                <Skeleton className="w-16 md:w-24 h-4 md:h-5 rounded" />
              </div>
            ))}
          </div>
          <Skeleton className="absolute top-[9px] md:top-[13px] left-0 right-0 h-0.5" />
        </div>
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-16 md:w-20 h-3 md:h-4 rounded" />
                <Skeleton className="w-full h-5 md:h-6 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="hidden sm:flex justify-between items-center">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-20 md:w-28 h-4 md:h-5 rounded" />
              ))}
            </div>
            {[...Array(2)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex flex-col sm:flex-row justify-between sm:items-center py-3 gap-2 sm:gap-0">
                <Skeleton className="w-full sm:w-24 h-8 sm:h-5 rounded" />
              </div>
            ))}
          </div>
          <div className="space-y-3 md:space-y-4 pt-4 md:pt-6 border-t flex flex-col items-end">
            <div className="flex justify-between w-full sm:w-64">
              <Skeleton className="w-20 md:w-24 h-4 md:h-5 rounded" />
              <Skeleton className="w-16 md:w-20 h-4 md:h-5 rounded" />
            </div>
            <div className="flex justify-between w-full sm:w-64">
              <Skeleton className="w-16 md:w-20 h-4 md:h-5 rounded" />
              <Skeleton className="w-16 md:w-20 h-4 md:h-5 rounded" />
            </div>
            <div className="flex justify-between w-full sm:w-64 pt-3 md:pt-4 border-t">
              <Skeleton className="w-12 md:w-16 h-5 md:h-6 rounded" />
              <Skeleton className="w-20 md:w-28 h-5 md:h-6 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4 sm:p-6 text-center text-red-600">
        {error ? "Failed to load order details" : "Order not found"}
      </div>
    );
  }

  const invoice = order.invoice;
  const summary = invoice?.summary;
  const subtotal = summary?.subtotal ?? order.items.reduce((sum, item) => sum + item.amount, 0);
  const deliveryFee = summary?.deliveryFee ?? order.shippingCost;
  const processingFee = summary?.processingFee ?? 0;
  const total = summary?.totalPayment ?? subtotal + deliveryFee + processingFee - order.discount;

  const progressSteps = [
    { label: "Pending", status: "Pending" },
    { label: "Accepted", status: "Accepted" },
    { label: "Shipped", status: "Shipped" },
    { label: "Delivered", status: "Delivered" },
  ];

  const currentStatus = order.status.toLowerCase();

  const getStepStatus = (stepStatus: string) => {
    const stepIndex = progressSteps.findIndex(
      (s) => s.status.toLowerCase() === stepStatus.toLowerCase()
    );
    const currentIndex = progressSteps.findIndex(
      (s) => s.status.toLowerCase() === currentStatus
    );
    if (stepIndex === -1 || currentIndex === -1) return "inactive";
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "inactive";
  };

  const BackIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4">
      <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const PrintIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );

  const DownloadIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <div className="p-2 sm:p-4 md:p-6 xl:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Link href="/dashboard/order-list">
          <button className="flex items-center gap-2 text-[#322F35] hover:text-gray-800 mb-3 md:mb-4">
            <BackIcon />
            <span className="text-base md:text-lg font-nun font-semibold">Back</span>
          </button>
        </Link>
        <h1 className="text-2xl sm:text-3xl md:text-[38px] font-nun font-bold text-[#322F35]">
          Order Details
        </h1>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-12 sm:mb-16 md:mb-[80px]">
        <div className="flex justify-between items-center relative z-10 px-2 sm:px-4">
          {progressSteps.map((step) => {
            const status = getStepStatus(step.status);
            const isActive = status === "active";
            const isCompleted = status === "completed";
            return (
              <div key={step.status} className="flex flex-col items-center w-1/4">
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center transition-all bg-white ${
                    isActive
                      ? "bg-orange-500 border-orange-500 shadow-lg scale-110"
                      : isCompleted
                      ? "bg-gray-400 border-gray-400"
                      : "border-gray-300"
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span
                  className={`mt-2 sm:mt-3 md:mt-4 text-[10px] sm:text-xs md:text-sm lg:text-[18px] text-center ${
                    isActive ? "text-[#FF914D] font-semibold" : isCompleted ? "text-gray-800 font-medium" : "text-gray-500 font-medium"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="absolute top-[9px] sm:top-[11px] md:top-[13px] left-[10%] right-[10%] h-0.5 bg-gray-200 -z-0">
          <div
            className="h-full bg-[#FF914D] transition-all duration-500"
            style={{
              width: `${
                (progressSteps.findIndex((s) => getStepStatus(s.status) === "active") /
                  (progressSteps.length - 1)) *
                100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Order Information Grid */}
      <div className="bg-white rounded-lg p-4 sm:p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          <div className="space-y-1">
            <h3 className="text-xs md:text-sm font-medium text-gray-600">SR No.</h3>
            <p className="text-sm md:text-base text-gray-800 font-medium break-all">{order.srNo}</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs md:text-sm font-medium text-gray-600">Date</h3>
            <p className="text-sm md:text-base text-gray-800">{order.date}</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs md:text-sm font-medium text-gray-600">Order ID</h3>
            <p className="text-sm md:text-base text-gray-800 font-medium break-all">{order.orderId}</p>
          </div>
          <div className="space-y-1 lg:col-span-2 xl:col-span-1">
            <h3 className="text-xs md:text-sm font-medium text-gray-600">Customer Contact</h3>
            <p className="text-sm md:text-base text-gray-800 font-medium">{order.customerName}</p>
            <p className="text-xs md:text-sm text-gray-600 truncate">{order.customerEmail}</p>
            <p className="text-xs md:text-sm text-gray-600">{order.customerPhone}</p>
          </div>
          <div className="space-y-1 sm:col-span-2 lg:col-span-3 xl:col-span-1">
            <h3 className="text-xs md:text-sm font-medium text-gray-600">Delivery Address</h3>
            <ul className="text-xs md:text-sm text-gray-800 space-y-0.5">
              <li><span className="text-gray-500">Region:</span> {order.region}</li>
              <li><span className="text-gray-500">Country:</span> {order.country}</li>
              <li><span className="text-gray-500">State:</span> {order.state}</li>
              <li><span className="text-gray-500">City:</span> {order.city}</li>
              <li><span className="text-gray-500">Zip Code:</span> {order.zipCode}</li>
              <li className="break-words"><span className="text-gray-500">Address:</span> {order.deliveryAddress}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Order Items & Summary */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">

        {/* Invoice Header with Action Buttons */}
        {invoice && (
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5 pb-4 border-b border-gray-200">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Invoice</p>
              <p className="text-sm md:text-base font-bold text-gray-800 break-all">
                #{invoice.invoiceNumber}
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <div className="flex flex-wrap gap-2">
                {/* View Invoice */}
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <EyeIcon />
                  View
                </button>
                {/* Print */}
                <button
                  onClick={() => {
                    setShowInvoiceModal(true);
                    setTimeout(handlePrint, 300);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <PrintIcon />
                  Print
                </button>
                {/* Download PDF */}
                <button
                  onClick={() => {
                    setShowInvoiceModal(true);
                    setTimeout(handleDownloadPDF, 300);
                  }}
                  disabled={pdfLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#FF914D] rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pdfLoading ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <DownloadIcon />
                  )}
                  {pdfLoading ? "Generating..." : "Download PDF"}
                </button>
              </div>
              <div className="flex flex-col sm:items-end gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm text-gray-500">Payment ID:</span>
                  <span className="text-xs md:text-sm font-medium text-gray-700 break-all">{invoice.paymentId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm text-gray-500">Payment Date:</span>
                  <span className="text-xs md:text-sm font-medium text-gray-700">
                    {new Date(invoice.paymentDate).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm text-gray-500">Currency:</span>
                  <span className="text-xs md:text-sm font-semibold text-gray-700">{invoice.currency}</span>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit ${
                    order.paymentStatus === "Paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] md:min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 md:py-4 px-2 text-xs md:text-sm font-semibold text-gray-600">SR NO.</th>
                <th className="text-left py-3 md:py-4 px-2 text-xs md:text-sm font-semibold text-gray-600">Order No.</th>
                <th className="text-left py-3 md:py-4 px-2 text-xs md:text-sm font-semibold text-gray-600">Product</th>
                <th className="text-left py-3 md:py-4 px-2 text-xs md:text-sm font-semibold text-gray-600">SKU</th>
                <th className="text-left py-3 md:py-4 px-2 text-xs md:text-sm font-semibold text-gray-600">Unit Price</th>
                <th className="text-left py-3 md:py-4 px-2 text-xs md:text-sm font-semibold text-gray-600">Qty</th>
                <th className="text-right py-3 md:py-4 px-2 text-xs md:text-sm font-semibold text-gray-600">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(invoice?.items ?? order.items).map((item: any, index: number) => (
                <tr key={item.id ?? index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-3 md:py-4 px-2 text-xs md:text-sm text-gray-600">{String(index + 1).padStart(2, "0")}</td>
                  <td className="py-3 md:py-4 px-2 text-xs md:text-sm text-gray-700 font-medium whitespace-nowrap">{item.orderNumber ?? order.srNo}</td>
                  <td className="py-3 md:py-4 px-2 text-xs md:text-sm text-gray-800 font-medium">{item.productName ?? order.items[index]?.productTitle ?? "—"}</td>
                  <td className="py-3 md:py-4 px-2 text-xs md:text-sm text-gray-500 font-mono">{item.sku ?? "—"}</td>
                  <td className="py-3 md:py-4 px-2 text-xs md:text-sm text-gray-800">${(item.unitPrice ?? order.items[index]?.itemPrice ?? 0).toFixed(2)}</td>
                  <td className="py-3 md:py-4 px-2 text-xs md:text-sm text-gray-800">{String(item.quantity ?? order.items[index]?.quantity ?? 1).padStart(2, "0")}</td>
                  <td className="py-3 md:py-4 px-2 text-xs md:text-sm text-gray-800 text-right font-semibold">${(item.itemSubtotal ?? order.items[index]?.amount ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-6 md:mt-8 border-t pt-4 md:pt-6">
          <div className="w-full sm:w-72 ml-auto space-y-2 md:space-y-3">
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-800 font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-gray-500">Delivery Fee</span>
              {deliveryFee === 0 ? (
                <span className="text-green-600 font-medium">Free</span>
              ) : (
                <span className="text-gray-800">+${deliveryFee.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-gray-500">Processing Fee</span>
              {processingFee === 0 ? (
                <span className="text-green-600 font-medium">Free</span>
              ) : (
                <span className="text-gray-800">+${processingFee.toFixed(2)}</span>
              )}
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600 font-medium">-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 md:pt-4 border-t border-gray-200 text-base md:text-lg font-bold">
              <span className="text-gray-800">Total</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[#FF914D]">${total.toFixed(2)}</span>
                <span className="text-xs font-medium text-gray-400">{invoice?.currency ?? "USD"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Invoice Modal ── */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[850px] relative">
            {/* Modal Toolbar */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-gray-200 px-5 py-3 rounded-t-2xl">
              <p className="text-sm font-bold text-gray-700">
                Invoice #{invoice?.invoiceNumber ?? order.orderId}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <PrintIcon />
                  Print
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#FF914D] rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-60"
                >
                  {pdfLoading ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <DownloadIcon />
                  )}
                  {pdfLoading ? "Generating..." : "Download PDF"}
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Invoice Content */}
            <div className="p-2 sm:p-4">
              <InvoiceTemplate order={order} invoiceRef={invoiceRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}