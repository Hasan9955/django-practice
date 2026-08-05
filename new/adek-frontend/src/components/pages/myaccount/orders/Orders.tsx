/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import { FaAngleDown } from "react-icons/fa6";
import ProgressTracker from "@/components/ui/Progress/progress-tracker";
import { ProgressStep } from "@/types/progress-tracker";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  CheckCheck,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Skeleton, Spin, Button, } from "antd";
import PriceDisplay from "@/components/PriceDisplay";
import { useAddProductReviewMutation } from "@/redux/features/product/productApi";
import toast from "react-hot-toast";
import ReviewModal from "./ReviewModal";

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

interface OrderDetailItemProps {
  label: string;
  value?: string;
}

const OrderDetailItem: React.FC<OrderDetailItemProps> = ({ label, value }) => (
  <div className="font-nun">
    <h6 className="font-semibold text-sm sm:text-base md:text-[17px] lg:text-[18px] text-[#1C1C1E] mb-1">
      {label}
    </h6>
    {value && (
      <p className="text-xs sm:text-sm md:text-[15px] lg:text-base font-normal text-[#606060] break-words">
        {value}
      </p>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   Star Rating Component
───────────────────────────────────────────── */




/* ─────────────────────────────────────────────
   Photo Thumbnail
───────────────────────────────────────────── */





/* ─────────────────────────────────────────────
   Review Modal
───────────────────────────────────────────── */



/* ─────────────────────────────────────────────
   Main Orders Component
───────────────────────────────────────────── */

const Orders = ({
  orders,
  isLoading,
}: {
  orders: any[];
  isLoading: boolean;
}) => {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [expandedAddresses, setExpandedAddresses] = useState<Set<string>>(new Set());
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set());

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [addProductReview, { isLoading: isSubmittingReview }] =
    useAddProductReviewMutation();

  const hasAutoOpenedRef = useRef(false);

  /* ── Status styles ── */
  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      Pending: "bg-amber-50 text-amber-700 border border-amber-200",
      Accepted: "bg-cyan-50 text-cyan-700 border border-cyan-200",
      Rejected: "bg-red-50 text-red-700 border border-red-200",
      Shipped: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      Delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    };
    return (
      styles[status] || "bg-gray-100 text-gray-700 border border-gray-200"
    );
  };

  /* ── Progress steps ── */
  const getProgressSteps = (status: string): ProgressStep[] => {
    if (status === "Rejected") {
      return [
        {
          id: "placed",
          title: "Order Placed",
          status: "Completed",
          statusColor: "#28A745",
          icon: Package,
          completed: true,
        },
        {
          id: "rejected",
          title: "Order Rejected",
          status: "Rejected",
          statusColor: "#DC3545",
          icon: XCircle,
          completed: true,
        },
      ];
    }

    return [
      {
        id: "placed",
        title: "Order Placed",
        status: "Completed",
        statusColor: "#28A745",
        icon: Package,
        completed: true,
      },
      {
        id: "accepted",
        title: "Accepted",
        status: status === "Pending" ? "Pending" : "Completed",
        statusColor: status === "Pending" ? "#6C757D" : "#28A745",
        icon: CheckCheck,
        completed: status !== "Pending",
      },
      {
        id: "shipped",
        title: "Shipped",
        status:
          status === "Shipped" || status === "Delivered"
            ? "Completed"
            : "Pending",
        statusColor:
          status === "Shipped" || status === "Delivered"
            ? "#28A745"
            : "#6C757D",
        icon: Truck,
        completed: status === "Shipped" || status === "Delivered",
      },
      {
        id: "delivered",
        title: "Delivered",
        status: status === "Delivered" ? "Completed" : "Pending",
        statusColor: status === "Delivered" ? "#28A745" : "#6C757D",
        icon: CheckCircle,
        completed: status === "Delivered",
      },
    ];
  };

  /* ── Toggles ── */
  const toggle = (set: Set<string>, setFn: (s: Set<string>) => void, id: string) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setFn(next);
  };

  /* ── Format date ── */
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  /* ── Review modal helpers ── */
  const openReviewModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedOrderId(null);
  };

  /* ── Auto-open review modal for delivered + unreviewed ── */
  useEffect(() => {
    if (isLoading || orders.length === 0 || hasAutoOpenedRef.current || isReviewModalOpen)
      return;

    const pending = orders.find(
      (o: any) => o.orderStatus === "Delivered" && !o.isReviewed
    );

    if (pending) {
      hasAutoOpenedRef.current = true;
      openReviewModal(pending.id);
    }
  }, [isLoading, orders, isReviewModalOpen]);

  /* ── Review submit handler ── */
  const handleReviewSubmit = async ({
    orderId,
    rating,
    comment,
    images,
    video,
  }: {
    orderId: string;
    rating: number;
    comment: string;
    images: File[];
    video: File | null;
  }) => {
    const formData = new FormData();

    images.forEach((img, i) => formData.append(`reviewImage_${i}`, img));
    if (video) formData.append("reviewVideo", video);

    formData.append(
      "bodyData",
      JSON.stringify({
        rating,
        comment: comment.trim() || "Recommended Product",
      })
    );

    try {
      await addProductReview({ orderId, data: formData }).unwrap();
      toast.success("Review submitted successfully! 🎉");
      closeReviewModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review. Please try again.");
    }
  };

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */
  return (
    <div className="rounded-[8px] my-6 sm:my-8 md:my-9 lg:my-10 xl:my-12 px-3 sm:px-4 md:px-6 lg:px-0">
      {/* Page Title */}
      <h4 className="text-xl sm:text-2xl md:text-[22px] lg:text-[24px] xl:text-[26px] font-nun text-[#1C1C1E] font-semibold mb-4 sm:mb-6 flex items-center">
        My Orders
        {isLoading ? (
          <Spin className="ml-3" />
        ) : (
          <span className="ml-2 text-[#606060]">({orders.length})</span>
        )}
      </h4>

      {/* Order list */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {isLoading ? (
          <Skeleton active />
        ) : orders.length > 0 ? (
          orders.map((order: any) => {
            const isExpanded = expandedOrders.has(order.id);
            const isAddressExpanded = expandedAddresses.has(order.id);
            const isInvoiceExpanded = expandedInvoices.has(order.id);
            const productPhoto = order.variant?.product?.productPhoto?.[0] || "";
            const productName = order.variant?.product?.productName || "Product";
            const invoice = order.invoiceSummary;

            return (
              <div
                key={order.id}
                className="border border-[#E0E0E0] rounded-[8px] sm:rounded-[12px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {/* ── Order Header ── */}
                <div className="bg-gradient-to-r from-[#F8F9FA] to-[#E9ECEF] p-3 sm:p-4 md:p-5 lg:p-6 border-b border-[#E0E0E0]">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-2">
                    <OrderDetailItem label="Order ID" value={order.id} />

                    {/* Total Payment */}
                    <div className="font-nun">
                      <div
                        className="flex items-center gap-2 cursor-pointer group w-fit mb-1"
                        onClick={() =>
                          toggle(expandedInvoices, setExpandedInvoices, order.id)
                        }
                      >
                        <h6 className="font-semibold text-sm sm:text-base md:text-[17px] lg:text-[18px] text-[#1C1C1E]">
                          Total Payment
                        </h6>
                        <FaAngleDown
                          className={`text-[#606060] transition-transform duration-200 ${
                            isInvoiceExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>

                      <PriceDisplay
                        basePrice={invoice?.totalPayment ?? order?.price}
                        showCode={false}
                        className="text-xs sm:text-sm md:text-[15px] lg:text-base font-normal text-[#606060] break-words"
                      />

                      {isInvoiceExpanded && invoice && (
                        <div className="mt-2 p-2.5 sm:p-3 bg-white border border-[#E0E0E0] rounded-[6px] shadow-sm animate-fadeIn min-w-[180px]">
                          <ul className="space-y-1.5">
                            <li className="flex items-center justify-between gap-4 text-xs sm:text-sm text-[#606060] font-nun">
                              <span>Item Subtotal</span>
                              <PriceDisplay
                                basePrice={invoice.itemSubtotal}
                                showCode={false}
                                className="font-medium text-[#1C1C1E]"
                              />
                            </li>
                            <li className="flex items-center justify-between gap-4 text-xs sm:text-sm text-[#606060] font-nun">
                              <span>Delivery Fee</span>
                              <PriceDisplay
                                basePrice={invoice.deliveryFee}
                                showCode={false}
                                className="font-medium text-[#1C1C1E]"
                              />
                            </li>
                            <li className="flex items-center justify-between gap-4 text-xs sm:text-sm text-[#606060] font-nun">
                              <span>Processing Fee</span>
                              <PriceDisplay
                                basePrice={invoice.processingFee}
                                showCode={false}
                                className="font-medium text-[#1C1C1E]"
                              />
                            </li>
                            <li className="flex items-center justify-between gap-4 pt-1.5 border-t border-[#E0E0E0] text-xs sm:text-sm font-nun">
                              <span className="font-semibold text-[#1C1C1E]">
                                Total
                              </span>
                              <PriceDisplay
                                basePrice={invoice.totalPayment}
                                showCode={false}
                                className="font-bold text-[#007BFF]"
                              />
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <OrderDetailItem
                      label="Order Date"
                      value={formatDate(order.createdAt)}
                    />

                    {/* Delivery Address */}
                    <div className="flex flex-col max-w-[250px] md:max-w-[300px]">
                      <div
                        className="flex items-center gap-2 cursor-pointer group w-fit mb-1"
                        onClick={() =>
                          toggle(expandedAddresses, setExpandedAddresses, order.id)
                        }
                      >
                        <h6 className="font-nun font-semibold text-sm sm:text-base md:text-[17px] lg:text-[18px] text-[#1C1C1E]">
                          Delivery Address
                        </h6>
                        <FaAngleDown
                          className={`text-[#606060] transition-transform duration-200 ${
                            isAddressExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>

                      {isAddressExpanded ? (
                        <ul className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm md:text-[15px] lg:text-base font-normal text-[#606060] break-words font-nun animate-fadeIn">
                          <li>
                            <span className="font-medium text-[#1C1C1E]">Region: </span>
                            {order?.region || "N/A"}
                          </li>
                          <li>
                            <span className="font-medium text-[#1C1C1E]">Country: </span>
                            {order?.country || "N/A"}
                          </li>
                          <li>
                            <span className="font-medium text-[#1C1C1E]">State: </span>
                            {order?.state || "N/A"}
                          </li>
                          <li>
                            <span className="font-medium text-[#1C1C1E]">Zip: </span>
                            {order?.zipCode || "N/A"}
                          </li>
                          <li>
                            <span className="font-medium text-[#1C1C1E]">Address: </span>
                            {order?.deliveryAddress || "N/A"}
                          </li>
                        </ul>
                      ) : (
                        <p
                          onClick={() =>
                            toggle(expandedAddresses, setExpandedAddresses, order.id)
                          }
                          className="text-xs sm:text-sm md:text-[15px] lg:text-base font-normal text-[#606060] truncate cursor-pointer hover:text-[#1C1C1E] transition-colors"
                          title={order?.deliveryAddress || "N/A"}
                        >
                          {order?.deliveryAddress || "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Product Info ── */}
                <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                  <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 relative flex-shrink-0 bg-gray-100 rounded-[6px] sm:rounded-[8px] overflow-hidden mx-auto xs:mx-0">
                      {productPhoto ? (
                        <Image
                          src={productPhoto}
                          alt={productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full xs:w-auto text-center xs:text-left">
                      <h6 className="font-inter text-base sm:text-lg md:text-[19px] lg:text-[20px] text-[#1C1C1E] font-semibold mb-1">
                        {productName}
                      </h6>
                      <p className="text-xs sm:text-sm md:text-[15px] lg:text-base text-[#606060] font-normal font-inter mb-2">
                        SKU: {order.variant?.sku || "N/A"}
                      </p>
                      <p className="text-sm sm:text-base md:text-[17px] lg:text-lg text-[#007BFF] font-medium font-inter">
                        Quantity: {order.quantity}
                      </p>
                    </div>

                    <div className="flex flex-col items-center xs:items-end gap-2 w-full xs:w-auto">
                      <span
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-[15px] lg:text-base font-nun font-semibold rounded-[4px] sm:rounded-[6px] ${getStatusStyles(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Track Order Section ── */}
                <div className="px-3 sm:px-4 md:px-5 lg:px-6 pb-3 sm:pb-4 md:pb-5 lg:pb-6">
                  <button
                    onClick={() =>
                      toggle(expandedOrders, setExpandedOrders, order.id)
                    }
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#007BFF] hover:bg-[#0069D9] text-white font-nun font-medium text-sm sm:text-base md:text-[17px] lg:text-[18px] px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-[5px] sm:rounded-[6px] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {isExpanded ? "Hide" : "Track"} Order
                    <FaAngleDown
                      className={`transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#E0E0E0] animate-fadeIn">
                      <h5 className="text-base sm:text-lg md:text-[17px] lg:text-[18px] font-nun font-semibold text-[#1C1C1E] mb-3 sm:mb-4">
                        Order Progress
                      </h5>

                      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                        <ProgressTracker
                          steps={getProgressSteps(order.orderStatus)}
                        />
                      </div>

                      {/* Additional info */}
                      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#F8F9FA] rounded-[6px] sm:rounded-[8px]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                          <div>
                            <p className="text-xs sm:text-sm md:text-[15px] text-[#606060] font-nun mb-1">
                              Region
                            </p>
                            <p className="text-sm sm:text-base md:text-[17px] text-[#1C1C1E] font-semibold font-nun">
                              {order.region || "N/A"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs sm:text-sm md:text-[15px] text-[#606060] font-nun mb-1">
                              Review Status
                            </p>
                            {order.orderStatus === "Delivered" &&
                            !order.isReviewed ? (
                              <Button
                                type="primary"
                                size="middle"
                                onClick={() => openReviewModal(order.id)}
                                className="font-nun font-medium bg-[#007BFF] hover:bg-[#0069D9]"
                              >
                                Write Review
                              </Button>
                            ) : (
                              <p className="text-sm sm:text-base md:text-[17px] text-[#1C1C1E] font-semibold font-nun flex items-center gap-1.5">
                                {order.isReviewed ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    Reviewed
                                  </>
                                ) : (
                                  "Not Reviewed"
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* Empty state */
          <div className="rounded-[8px] my-6 sm:my-8 md:my-10 lg:my-12 text-center py-12 sm:py-16 md:py-20 px-4">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto text-gray-400 mb-4" />
            <h4 className="text-xl sm:text-2xl md:text-[22px] lg:text-[24px] font-nun text-[#1C1C1E] font-semibold mb-2">
              No Orders Yet
            </h4>
            <p className="text-[#606060] text-sm sm:text-base md:text-[17px]">
              You haven't placed any orders yet.
            </p>
          </div>
        )}
      </div>

      {/* ── Review Modal ── */}
      <ReviewModal
        open={isReviewModalOpen}
        onClose={closeReviewModal}
        orderId={selectedOrderId}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmittingReview}
      />
    </div>
  );
};

export default Orders;