/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  KeyboardEvent,
} from "react";
import {
  Send,
  RefreshCw,
  Paperclip,
  X,
  Plus,
  Minus,
  Trash2,
  Search,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import {
  Modal,
  DatePicker,
  InputNumber,
  message as antMessage,
  Spin,
  Empty,
  Input as AntInput,
  Tag,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useSingleConversationQuery } from "@/redux/features/messages/messagesApi";
import { useImageUploadMutation } from "@/redux/features/logo/logoSlice";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar/avatar";
import { Badge } from "@/components/ui/Badge/badge";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import {
  useGetSellerB2BConversationsListQuery,
  useGetAllSellerB2BOffersQuery,
  useCreateB2BOfferMutation,
} from "@/redux/features/dashborad/b2bProtal/b2bProtalApi";
import { MdLocalOffer } from "react-icons/md";
import { BsFillSendArrowUpFill } from "react-icons/bs";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_LIMIT = 20;
const CONV_LIMIT = 20;

// ─── Pagination Hooks ─────────────────────────────────────────────────────────
export function useChatPagination(conversationId: string | undefined) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const prevScrollHeight = useRef(0);
  const justPrepended = useRef(false);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setIsFetchingMore(false);
    setInitialLoaded(false);
    justPrepended.current = false;
    prevScrollHeight.current = 0;
  }, [conversationId]);

  const handleScrollForMore = useCallback(
    (container: HTMLDivElement | null) => {
      if (!container || !hasMore || isFetchingMore || !initialLoaded) return;
      if (container.scrollTop < 80) {
        prevScrollHeight.current = container.scrollHeight;
        setPage((p) => p + 1);
        setIsFetchingMore(true);
      }
    },
    [hasMore, isFetchingMore, initialLoaded],
  );

  const restoreScrollAfterPrepend = useCallback(
    (container: HTMLDivElement | null) => {
      if (!justPrepended.current || !container) return false;
      justPrepended.current = false;
      const newHeight = container.scrollHeight;
      container.scrollTop = newHeight - prevScrollHeight.current;
      return true;
    },
    [],
  );

  return {
    page,
    hasMore,
    setHasMore,
    isFetchingMore,
    setIsFetchingMore,
    initialLoaded,
    setInitialLoaded,
    justPrepended,
    handleScrollForMore,
    restoreScrollAfterPrepend,
  };
}

export function useConversationListPagination() {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const handleSidebarScroll = useCallback(
    (container: HTMLDivElement | null, onLoadMore: () => void) => {
      if (!container || isFetching || !hasMore) return;
      const nearBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 60;
      if (nearBottom) onLoadMore();
    },
    [isFetching, hasMore],
  );

  const loadNextPage = useCallback(() => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);
    setPage((p) => p + 1);
  }, [isFetching, hasMore]);

  const onPageLoaded = useCallback(
    (total: number) => {
      setIsFetching(false);
      setHasMore(page * CONV_LIMIT < total);
    },
    [page],
  );

  return {
    page,
    hasMore,
    setHasMore,
    isFetching,
    setIsFetching,
    loadNextPage,
    onPageLoaded,
    handleSidebarScroll,
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface OfferItem {
  id: string;
  productId: string;
  offerId: string;
  unitPrice: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface OfferPayload {
  id: string;
  conversationId: string;
  offerStuts: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  isDelivered: boolean;
  buyerId: string;
  sellerId: string;
  expectedDeliveryDate: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  offer_Items: OfferItem[];
}

interface TextMessage {
  id: string;
  type: "text" | "offer" | "image";
  sender: "buyer" | "seller";
  content: string;
  imageUrl?: string;
  timestamp: string;
  createdAt: string;
  messageType?: string;
  offerData?: OfferPayload;
}

interface Conversation {
  id: string;
  buyerUserId: string;
  seller: string;
  product: string;
  orderNumber: string;
  time: string;
  avatar: string;
  unreadCount: number;
  messages: TextMessage[];
  email: string;
}

interface WsMsg {
  type: string;
  senderId?: string;
  receiverId?: string;
  content?: unknown;
  imageUrl?: string;
  timestamp?: string;
  message?: unknown;
  _id?: string;
  messageId?: string;
  isTyping?: boolean;
  userId?: string;
  messageType?: string;
}

interface OfferProduct {
  productId: string;
  productName: string;
  productPhoto: string[];
  perProductPrice: number;
}

interface OfferLineItem {
  productId: string;
  productName: string;
  productPhoto: string;
  unitPrice: number;
  quantity: number;
}

interface Participant {
  userId?: string;
  username?: string;
  image?: string;
}

interface B2BChatSellerProps {
  conversationId?: string;
  participant?: Participant;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function tryParseOffer(content: unknown): OfferPayload | null {
  if (!content) return null;

  if (typeof content === "object" && content !== null) {
    const obj = content as Record<string, unknown>;
    const offerData = obj.offerData ?? obj;
    if (
      typeof offerData === "object" &&
      offerData !== null &&
      "id" in offerData &&
      "offerStuts" in offerData &&
      "offer_Items" in offerData
    ) {
      return offerData as OfferPayload;
    }
    return null;
  }

  if (typeof content === "string") {
    const trimmed = content.trim();
    if (!trimmed.startsWith("{")) return null;
    try {
      const parsed = JSON.parse(trimmed);
      const offerData = parsed.offerData ?? parsed;
      if (
        typeof offerData === "object" &&
        offerData !== null &&
        "id" in offerData &&
        "offerStuts" in offerData &&
        "offer_Items" in offerData
      ) {
        return offerData as OfferPayload;
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

function formatApiMessages(
  rawList: any[],
  currentUserId: string | undefined,
): TextMessage[] {
  return [...rawList]
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((msg: any, index: number) => {
      const msgType: string = msg.messageType || msg.chatType || "B2B";
      const isSeller = msg.senderId === currentUserId;

      let offerData: OfferPayload | undefined;
      let resolvedType: "text" | "offer" | "image" = "text";
      let rawContent = "";

      const contentIsObject =
        typeof msg.content === "object" && msg.content !== null;
      if (msgType === "OFFER" || contentIsObject) {
        const offer = tryParseOffer(msg.content);
        if (offer) {
          offerData = offer;
          resolvedType = "offer";
        }
      }

      if (resolvedType === "text") {
        if (typeof msg.content === "string") {
          rawContent = msg.content;
        }
        if (msg.imageUrl && !rawContent) {
          resolvedType = "image";
        }
      }

      // Stable deterministic ID — never use Date.now()/Math.random()
      const stableId =
        msg.id ||
        msg._id ||
        `msg-${msg.createdAt || "no-date"}-${
          msg.senderId || "no-sender"
        }-${index}`;

      return {
        id: stableId,
        type: resolvedType,
        sender: isSeller ? "seller" : "buyer",
        content: resolvedType === "offer" ? "" : rawContent,
        imageUrl: msg.imageUrl ?? undefined,
        timestamp: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        createdAt: msg.createdAt || new Date().toISOString(),
        messageType: msgType,
        offerData,
      };
    });
}

function timeAgo(isoString?: string): string {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── UI Sub-components ────────────────────────────────────────────────────────
function LoadMoreIndicator({
  isFetching,
  hasMore,
  messageCount,
}: {
  isFetching: boolean;
  hasMore: boolean;
  messageCount: number;
}) {
  if (isFetching) {
    return (
      <div className="flex justify-center py-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Loading older messages…</span>
        </div>
      </div>
    );
  }
  if (!hasMore && messageCount > 0) {
    return (
      <div className="flex items-center gap-3 py-3 px-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[10px] text-gray-400 whitespace-nowrap">
          Beginning of conversation
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    );
  }
  return null;
}

function UserAvatar({
  src,
  name,
  size = 40,
  className = "",
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <Avatar style={{ width: size, height: size }} className={className}>
      <AvatarFallback style={{ fontSize: size * 0.4 }}>
        {name?.[0]?.toUpperCase() ?? "?"}
      </AvatarFallback>
    </Avatar>
  );
}

function OfferCard({
  offer,
  isSeller,
}: {
  offer: OfferPayload;
  isSeller: boolean;
}) {
  const statusMap: Record<
    string,
    { color: string; bg: string; icon: React.ReactNode; label: string }
  > = {
    PENDING: {
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      icon: <Clock className="w-3 h-3" />,
      label: "Pending",
    },
    ACCEPTED: {
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
      icon: <CheckCircle className="w-3 h-3" />,
      label: "Accepted",
    },
    REJECTED: {
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
      icon: <XCircle className="w-3 h-3" />,
      label: "Rejected",
    },
    CANCELLED: {
      color: "text-gray-500",
      bg: "bg-gray-50 border-gray-200",
      icon: <XCircle className="w-3 h-3" />,
      label: "Cancelled",
    },
  };
  const status = statusMap[offer.offerStuts] ?? statusMap.PENDING;
  const deliveryDate = new Date(offer.expectedDeliveryDate).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "short", day: "numeric" },
  );

  return (
    <div
      className={`rounded-2xl border shadow-sm overflow-hidden w-72 ${
        isSeller ? "rounded-br-none" : "rounded-bl-none"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="flex items-center gap-2 text-white">
          <MdLocalOffer className="text-base" />
          <span className="text-sm font-semibold">Business Offer</span>
        </div>
        <span
          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${status.bg} ${status.color}`}
        >
          {status.icon}
          {status.label}
        </span>
      </div>
      <div className="bg-white px-4 py-3 space-y-2">
        {offer.offer_Items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-1.5"
          >
            <div className="flex items-center gap-2 text-gray-700 min-w-0">
              <Package className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate text-xs font-mono">
                #{item.productId.slice(-6)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-gray-600 text-xs">
              <span className="text-gray-400">×{item.quantity}</span>
              <span className="font-semibold text-blue-600">
                ${item.unitPrice.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>By {deliveryDate}</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 leading-none">Total</p>
          <p className="text-sm font-bold text-blue-600">
            ${offer.totalPrice.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({
  avatar,
  name,
}: {
  avatar?: string | null;
  name: string;
}) {
  return (
    <div className="flex items-end gap-2">
      <UserAvatar src={avatar} name={name} size={32} />
      <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
        <div className="flex space-x-1">
          {[0, 0.15, 0.3].map((d, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: `${d}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[false, true, false, true, false].map((right, i) => (
        <div
          key={i}
          className={`flex items-end gap-2 ${
            right ? "justify-end" : "justify-start"
          }`}
        >
          {!right && (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
          )}
          <div
            className={`h-9 rounded-2xl animate-pulse ${
              right ? "bg-blue-100" : "bg-gray-200"
            }`}
            style={{ width: `${100 + ((i * 43) % 100)}px` }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Create Offer Modal ───────────────────────────────────────────────────────
interface CreateOfferModalProps {
  open: boolean;
  onClose: () => void;
  buyerId: string;
  buyerName: string;
}

function CreateOfferModal({
  open,
  onClose,
  buyerId,
  buyerName,
}: CreateOfferModalProps) {
  const [lineItems, setLineItems] = useState<OfferLineItem[]>([]);
  const [deliveryDate, setDeliveryDate] = useState<Dayjs | null>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<OfferProduct[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [messageApi, contextHolder] = antMessage.useMessage();
  const productListRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const LIMIT = 10;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPage(1);
      setAllProducts([]);
      setHasMore(true);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  const {
    data: packagesData,
    isLoading: packagesLoading,
    isFetching,
  } = useGetAllSellerB2BOffersQuery(
    { page, limit: LIMIT, search: debouncedSearch },
    { skip: !open },
  );

  useEffect(() => {
    if (!packagesData?.result?.data) return;
    const incoming: OfferProduct[] = packagesData.result.data.map(
      (item: any) => ({
        productId: item.productId,
        productName: item.productName,
        productPhoto: item.productPhoto ?? [],
        perProductPrice: item.packages?.[0]?.perProductPrice ?? 0,
      }),
    );
    setAllProducts((prev) => {
      if (page === 1) return incoming;
      const existingIds = new Set(prev.map((p) => p.productId));
      return [
        ...prev,
        ...incoming.filter((p) => !existingIds.has(p.productId)),
      ];
    });
    const total = packagesData.result.meta?.total ?? 0;
    setHasMore(page * LIMIT < total);
  }, [packagesData, page]);

  const handleProductScroll = () => {
    const el = productListRef.current;
    if (!el || isFetching || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20)
      setPage((p) => p + 1);
  };

  const [createOffer, { isLoading: isSubmitting }] =
    useCreateB2BOfferMutation();

  useEffect(() => {
    if (open) {
      setLineItems([]);
      setDeliveryDate(null);
      setSearchText("");
      setDebouncedSearch("");
      setPage(1);
      setAllProducts([]);
      setHasMore(true);
    }
  }, [open]);

  const isAdded = (productId: string) =>
    lineItems.some((li) => li.productId === productId);

  const addProduct = (product: OfferProduct) => {
    if (isAdded(product.productId)) return;
    setLineItems((prev) => [
      ...prev,
      {
        productId: product.productId,
        productName: product.productName,
        productPhoto: product.productPhoto[0] ?? "",
        unitPrice: product.perProductPrice,
        quantity: 1,
      },
    ]);
  };

  const removeProduct = (productId: string) =>
    setLineItems((prev) => prev.filter((li) => li.productId !== productId));

  const updateItem = (
    productId: string,
    field: "quantity" | "unitPrice",
    value: number,
  ) =>
    setLineItems((prev) =>
      prev.map((li) =>
        li.productId === productId ? { ...li, [field]: value } : li,
      ),
    );

  const grandTotal = lineItems.reduce(
    (sum, li) => sum + li.unitPrice * li.quantity,
    0,
  );

  const handleSubmit = async () => {
    if (lineItems.length === 0) {
      messageApi.warning("Add at least one product.");
      return;
    }
    if (!deliveryDate) {
      messageApi.warning("Please select a delivery date.");
      return;
    }
    try {
      await createOffer({
        buyerId,
        expectedDeliveryDate: deliveryDate.toISOString(),
        offerItems: lineItems.map((li) => ({
          productId: li.productId,
          unitPrice: li.unitPrice,
          quantity: li.quantity,
        })),
      }).unwrap();
      messageApi.success("Offer sent successfully! 🎉");
      onClose();
    } catch (err: any) {
      messageApi.error(err?.data?.message ?? "Failed to send offer.");
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        onCancel={onClose}
        title={
          <div className="flex items-center gap-2 py-0.5">
            <MdLocalOffer className="text-blue-500 text-xl shrink-0" />
            <span className="text-base font-semibold text-gray-800">
              Create Offer
            </span>
            <span className="text-sm text-gray-400 font-normal truncate">
              → {buyerName}
            </span>
          </div>
        }
        footer={null}
        width={700}
        centered
        destroyOnClose
      >
        <div className="flex flex-col gap-5 pt-1 max-h-[78vh] overflow-y-auto pr-1">
          <section>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              1 · Select Products
            </p>
            <AntInput
              prefix={<Search className="w-3.5 h-3.5 text-gray-400" />}
              placeholder="Search products by name…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="mb-3"
            />
            {packagesLoading && page === 1 ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : allProducts.length === 0 && !isFetching ? (
              <Empty
                description={
                  debouncedSearch
                    ? `No products found for "${debouncedSearch}"`
                    : "No B2B products found"
                }
                imageStyle={{ height: 48 }}
              />
            ) : (
              <>
                <div
                  ref={productListRef}
                  onScroll={handleProductScroll}
                  className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1"
                >
                  {allProducts.map((product) => {
                    const added = isAdded(product.productId);
                    return (
                      <div
                        key={product.productId}
                        onClick={() =>
                          added
                            ? removeProduct(product.productId)
                            : addProduct(product)
                        }
                        className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all select-none ${
                          added
                            ? "border-blue-400 bg-blue-50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {product.productPhoto[0] ? (
                            <Image
                              src={product.productPhoto[0]}
                              alt={product.productName}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">
                              📦
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {product.productName}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${product.perProductPrice.toFixed(2)} / unit
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            added
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {added ? (
                            <Minus className="w-3 h-3" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {isFetching && page > 1 && (
                    <div className="col-span-2 flex justify-center py-3">
                      <Spin size="small" />
                    </div>
                  )}
                  {!hasMore && allProducts.length > 0 && (
                    <div className="col-span-2 text-center text-xs text-gray-400 py-2">
                      All products loaded
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1.5 px-0.5">
                  <span className="text-[11px] text-gray-400">
                    {allProducts.length} product
                    {allProducts.length !== 1 ? "s" : ""}
                    {hasMore ? " · scroll for more" : ""}
                  </span>
                  {lineItems.length > 0 && (
                    <Tag color="blue" className="text-[11px]">
                      {lineItems.length} selected
                    </Tag>
                  )}
                </div>
              </>
            )}
          </section>

          {lineItems.length > 0 && (
            <section>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                2 · Set Quantity & Price{" "}
                <span className="text-gray-300 font-normal normal-case">
                  ({lineItems.length} item{lineItems.length > 1 ? "s" : ""})
                </span>
              </p>
              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                {lineItems.map((li) => (
                  <div
                    key={li.productId}
                    className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                      {li.productPhoto ? (
                        <Image
                          src={li.productPhoto}
                          alt={li.productName}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-base">
                          📦
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 flex-1 truncate min-w-0">
                      {li.productName}
                    </p>
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                      <span className="text-[10px] text-gray-400 leading-none">
                        Qty
                      </span>
                      <InputNumber
                        min={1}
                        value={li.quantity}
                        onChange={(v) =>
                          updateItem(li.productId, "quantity", v ?? 1)
                        }
                        size="small"
                        style={{ width: 68 }}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                      <span className="text-[10px] text-gray-400 leading-none">
                        $/unit
                      </span>
                      <InputNumber
                        min={0}
                        precision={2}
                        value={li.unitPrice}
                        onChange={(v) =>
                          updateItem(li.productId, "unitPrice", v ?? 0)
                        }
                        size="small"
                        style={{ width: 84 }}
                        prefix="$"
                      />
                    </div>
                    <div className="flex flex-col items-end shrink-0 w-16">
                      <span className="text-[10px] text-gray-400 leading-none">
                        Total
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        ${(li.unitPrice * li.quantity).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeProduct(li.productId)}
                      className="text-gray-300 hover:text-red-400 transition-colors shrink-0 ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-2 pr-1">
                <span className="text-sm text-gray-600">
                  Grand total:{" "}
                  <span className="text-blue-600 font-bold text-base">
                    $
                    {grandTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </span>
              </div>
            </section>
          )}

          <section>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              3 · Expected Delivery Date
            </p>
            <DatePicker
              value={deliveryDate}
              onChange={(d) => setDeliveryDate(d)}
              disabledDate={(d) => d && d.isBefore(dayjs(), "day")}
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              placeholder="Select delivery date & time"
              className="w-full"
            />
          </section>

          <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-100 sticky bottom-0 bg-white pb-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || lineItems.length === 0 || !deliveryDate}
              className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <BsFillSendArrowUpFill />
              )}
              {isSubmitting ? "Sending…" : "Send Offer"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─── SidebarChat ──────────────────────────────────────────────────────────────
interface SidebarChatProps {
  token: string;
  userId: string | undefined;
  initialConversations: Conversation[];
  initialSelectedId?: string;
  onLoadMoreConversations?: () => void;
  isLoadingMoreConversations?: boolean;
  hasMoreConversations?: boolean;
}

function SidebarChat({
  token,
  userId,
  initialConversations,
  initialSelectedId,
  onLoadMoreConversations,
  isLoadingMoreConversations,
  hasMoreConversations,
}: SidebarChatProps) {
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState(initialSelectedId || "");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [hasJoinedApp, setHasJoinedApp] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [offerModalOpen, setOfferModalOpen] = useState(false);

  const {
    page: msgPage,
    hasMore: msgHasMore,
    setHasMore: setMsgHasMore,
    isFetchingMore,
    setIsFetchingMore,
    initialLoaded,
    setInitialLoaded,
    justPrepended,
    handleScrollForMore,
    restoreScrollAfterPrepend,
  } = useChatPagination(selectedId);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sidebarListRef = useRef<HTMLDivElement>(null);

  const skipNextScrollRef = useRef(false);
  const isFirstScrollRef = useRef(true);

  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isConnecting = useRef(false);
  const currentPrivateChatUser = useRef<string | null>(null);
  const pendingJoinRef = useRef<string | null>(null);

  // ─── FIX BUG-1 + BUG-2 ───────────────────────────────────────────────────
  // REMOVED: knownIdsMap.current — this was the root cause of real-time messages
  // never appearing. The map was populated with all API-loaded IDs on the initial
  // history fetch. Every subsequent WS message had its ID checked against that map,
  // found "already known", and was silently dropped via `if (knownIds.has(newMsg.id))
  // return conv`.
  //
  // FIX: dedup is now done INSIDE setConversations using conv.messages.some() —
  // identical to how MessagesPage's SidebarChat does it. This runs on the latest
  // state snapshot, never a stale closure, and WS messages are never pre-filtered.
  //
  // We keep a separate initialLoadedConvs Set only to gate the "initial history load"
  // path vs the "paginate older messages" path — it does NOT gate WS message insertion.
  const initialLoadedConvs = useRef<Set<string>>(new Set());

  const userIdRef = useRef(userId);
  const selectedIdRef = useRef(selectedId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    isFirstScrollRef.current = true;
  }, [selectedId]);

  // ─── FIX BUG-5 ───────────────────────────────────────────────────────────
  // Original code had an early-exit `if (!prev.length) return initialConversations`
  // which skipped the merge logic once any conversations were loaded. Subsequent
  // pages (from infinite scroll) were silently discarded.
  // FIX: always merge — same pattern as MessagesPage.
  useEffect(() => {
    if (!initialConversations.length) return;
    setConversations((prev) => {
      if (!prev.length) return initialConversations;
      const map = new Map(prev.map((c) => [c.id, c]));
      initialConversations.forEach((ic) => {
        if (!map.has(ic.id)) {
          map.set(ic.id, ic);
        } else {
          const ex = map.get(ic.id)!;
          map.set(ic.id, {
            ...ex,
            unreadCount: ic.unreadCount,
            time: ic.time,
            avatar: ic.avatar,
          });
        }
      });
      return Array.from(map.values());
    });
  }, [initialConversations]);

  const currentConv = conversations.find((c) => c.id === selectedId) ?? null;

  const [imageUpload, { isLoading: isImageUploading }] =
    useImageUploadMutation();

  const { data: historyData, isLoading: historyLoading } =
    useSingleConversationQuery(
      {
        conversationId: selectedId,
        limit: PAGE_LIMIT,
        page: msgPage,
        chatType: "B2B",
      },
      { skip: !selectedId },
    );

  // ─── FIX BUG-4 ───────────────────────────────────────────────────────────
  // Original: used knownIdsMap for both history dedup AND the initial-vs-paginate
  // gate, causing the paginate path to misbehave when IDs overlapped with WS IDs.
  // FIX: use initialLoadedConvs (Set of conv IDs that have had page-1 loaded)
  // to determine which path to take. Paginate path still deduplicates by checking
  // existingIds from the current conv.messages — no shared map contamination.
  useEffect(() => {
    if (!historyData?.result || !selectedId) return;

    const formatted = formatApiMessages(historyData.result, userIdRef.current);
    const isInitial = !initialLoadedConvs.current.has(selectedId);

    if (formatted.length < PAGE_LIMIT) {
      setMsgHasMore(false);
    }

    if (isInitial) {
      initialLoadedConvs.current.add(selectedId);
      setInitialLoaded(true);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id !== selectedId ? conv : { ...conv, messages: formatted },
        ),
      );
    } else if (isFetchingMore) {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== selectedId) return conv;
          const existingIds = new Set(conv.messages.map((m) => m.id));
          const incoming = formatted.filter((m) => !existingIds.has(m.id));
          if (incoming.length === 0) return conv;
          justPrepended.current = true;
          return { ...conv, messages: [...incoming, ...conv.messages] };
        }),
      );
      setIsFetchingMore(false);
    }
  }, [
    historyData,
    selectedId,
    isFetchingMore,
    setMsgHasMore,
    setInitialLoaded,
    setIsFetchingMore,
    justPrepended,
  ]);

  // Restore scroll position synchronously before paint when messages prepended
  useLayoutEffect(() => {
    if (justPrepended.current && messagesContainerRef.current) {
      skipNextScrollRef.current = true;
      restoreScrollAfterPrepend(messagesContainerRef.current);
    }
  }, [currentConv?.messages.length, restoreScrollAfterPrepend]);

  // ─── FIX BUG-3 ───────────────────────────────────────────────────────────
  // Single scroll-to-bottom effect with skipNextScrollRef guard prevents the
  // jarring jump-to-bottom that happened when older messages were prepended.
  useEffect(() => {
    if (!initialLoaded || isFetchingMore) return;
    if (skipNextScrollRef.current) {
      skipNextScrollRef.current = false;
      return;
    }
    const behavior = isFirstScrollRef.current ? "auto" : "smooth";
    isFirstScrollRef.current = false;
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, [currentConv?.messages.length, initialLoaded, isFetchingMore]);

  const handleScrollTop = useCallback(() => {
    if (isFetchingMore) return;
    handleScrollForMore(messagesContainerRef.current);
  }, [isFetchingMore, handleScrollForMore]);

  const cleanup = useCallback(() => {
    if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    if (wsRef.current) {
      wsRef.current.onopen =
        wsRef.current.onclose =
        wsRef.current.onerror =
        wsRef.current.onmessage =
          null;
      if (wsRef.current.readyState === WebSocket.OPEN) wsRef.current.close();
      wsRef.current = null;
    }
    isConnecting.current = false;
  }, []);

  // ─── FIX BUG-1 + BUG-2 + BUG-6 + BUG-7 ─────────────────────────────────
  //
  // BUG-1 FIX: The old handler checked knownIdsMap.current before inserting, which
  //   was pre-filled by the API history load and caused all WS messages to be dropped.
  //   Now dedup is done inside setConversations via conv.messages.some() — always
  //   checking the latest state, never a stale map.
  //
  // BUG-2 FIX: Removed knownIdsMap entirely from the WS message path.
  //
  // BUG-6 FIX: When the seller sends a message, the WS echo may arrive with
  //   receiverId missing. The original code set otherUserId = null in that case,
  //   meaning NO conversation matched and the message was silently lost. Fix:
  //   fall back to selectedIdRef.current when otherUserId is null, matching the
  //   currently open conversation (the one the seller is actively typing in).
  //
  // BUG-7 FIX: Use stable deterministic IDs (timestamp + senderId) instead of
  //   Date.now()+Math.random(). Unstable IDs cause React to treat every re-render
  //   as a new message, triggering unnecessary DOM mutations and scroll jumps.
  const handleIncomingMessage = useCallback((data: WsMsg) => {
    if (!data.senderId) return;

    const isOwn = data.senderId === userIdRef.current;

    // BUG-6 FIX: fall back to selectedId when receiverId is absent on echo-back
    const otherUserId = isOwn
      ? (data.receiverId ?? null)
      : data.senderId;

    const offerData = tryParseOffer(data.content);
    const rawContent = offerData
      ? ""
      : typeof data.content === "string"
      ? data.content
      : typeof data.message === "string"
      ? data.message
      : "";

    // BUG-7 FIX: stable deterministic ID
    const stableId =
      data._id ||
      data.messageId ||
      `ws-${data.timestamp || Date.now()}-${data.senderId}`;

    const newMsg: TextMessage = {
      id: stableId,
      type: offerData
        ? "offer"
        : data.imageUrl && !rawContent
        ? "image"
        : "text",
      sender: isOwn ? "seller" : "buyer",
      content: rawContent,
      imageUrl: data.imageUrl,
      offerData: offerData ?? undefined,
      timestamp: data.timestamp
        ? new Date(data.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      createdAt: data.timestamp || new Date().toISOString(),
      messageType: data.messageType || "PRIVATEMESSAGE",
    };

    setConversations((prev) =>
      prev.map((conv) => {
        // BUG-6 FIX: match by buyerUserId when available, otherwise fall back
        // to the currently selected conversation (handles missing receiverId on
        // the seller's own echo-back messages).
        const isMatch = otherUserId
          ? conv.buyerUserId === otherUserId
          : conv.id === selectedIdRef.current;

        if (!isMatch) return conv;

        // BUG-1 + BUG-2 FIX: dedup inside setConversations using the live
        // messages array — never via a pre-filled external map.
        if (conv.messages.some((m) => m.id === newMsg.id)) return conv;

        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          unreadCount:
            isOwn || conv.id === selectedIdRef.current
              ? conv.unreadCount
              : conv.unreadCount + 1,
        };
      }),
    );
  }, []);

  const handlerRef = useRef(handleIncomingMessage);
  useEffect(() => {
    handlerRef.current = handleIncomingMessage;
  }, [handleIncomingMessage]);

  const connectWebSocket = useCallback(() => {
    if (
      !token ||
      isConnecting.current ||
      wsRef.current?.readyState === WebSocket.OPEN
    )
      return;
    isConnecting.current = true;
    cleanup();
    setConnectionStatus("connecting");

    const ws = new WebSocket(
      `wss://api.sellapy.com?token=${encodeURIComponent(token)}`,
    );

    ws.onopen = () => {
      setConnectionStatus("connected");
      reconnectAttempts.current = 0;
      isConnecting.current = false;
      ws.send(JSON.stringify({ type: "joinApp" }));
      setHasJoinedApp(true);
    };

    ws.onmessage = (event) => {
      try {
        const parsed: WsMsg = JSON.parse(event.data);
        if (parsed.type === "receivePrivateMessage") {
          handlerRef.current(parsed);
        } else if (parsed.type === "typing") {
          setIsTyping(
            parsed.isTyping === true &&
              parsed.userId === currentPrivateChatUser.current,
          );
        }
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onclose = (event) => {
      setConnectionStatus("disconnected");
      setHasJoinedApp(false);
      isConnecting.current = false;
      currentPrivateChatUser.current = null;
      if (event.code !== 1000 && reconnectAttempts.current < 5) {
        const delay = 3000 * (reconnectAttempts.current + 1);
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connectWebSocket();
        }, delay);
      }
    };

    ws.onerror = () => setConnectionStatus("error");
    wsRef.current = ws;
  }, [token, cleanup]);

  const joinPrivateChat = useCallback(
    (buyerUserId: string) => {
      if (wsRef.current?.readyState !== WebSocket.OPEN || !hasJoinedApp) {
        pendingJoinRef.current = buyerUserId;
        return;
      }
      if (currentPrivateChatUser.current === buyerUserId) return;
      wsRef.current.send(
        JSON.stringify({
          type: "joinPrivateChat",
          user2Id: buyerUserId,
          chatType: "B2B",
        }),
      );
      currentPrivateChatUser.current = buyerUserId;
      pendingJoinRef.current = null;
    },
    [hasJoinedApp],
  );

  useEffect(() => {
    if (
      connectionStatus === "connected" &&
      hasJoinedApp &&
      pendingJoinRef.current
    ) {
      joinPrivateChat(pendingJoinRef.current);
    }
  }, [connectionStatus, hasJoinedApp, joinPrivateChat]);

  useEffect(() => {
    if (token) connectWebSocket();
    return () => cleanup();
  }, [token, connectWebSocket, cleanup]);

  const handleSelect = useCallback(
    (conv: Conversation) => {
      setSelectedId(conv.id);
      setIsTyping(false);
      setMessage("");
      setImageUrl("");
      setSelectedFile(null);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)),
      );
      joinPrivateChat(conv.buyerUserId);
    },
    [joinPrivateChat],
  );

  const handleSidebarScrollLocal = useCallback(() => {
    const container = sidebarListRef.current;
    if (!container || isLoadingMoreConversations || !hasMoreConversations)
      return;
    const nearBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 60;
    if (nearBottom) onLoadMoreConversations?.();
  }, [
    isLoadingMoreConversations,
    hasMoreConversations,
    onLoadMoreConversations,
  ]);

  const handleSendMessage = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed && !imageUrl) return;
    if (!currentConv || wsRef.current?.readyState !== WebSocket.OPEN) return;
    const payload: Record<string, string> = {
      type: "sendPrivateMessage",
      receiverId: currentConv.buyerUserId,
      content: trimmed,
      chatType: "B2B",
    };
    if (imageUrl) payload.imageUrl = imageUrl;
    wsRef.current.send(JSON.stringify(payload));
    setMessage("");
    setImageUrl("");
    setSelectedFile(null);
  }, [message, imageUrl, currentConv]);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    setSelectedFile(file);
    try {
      const formData = new FormData();
      formData.append("chatImage", file);
      const res = await imageUpload(formData).unwrap();
      setImageUrl(res?.result || "");
    } catch {
      setSelectedFile(null);
      setImageUrl("");
    }
  };

  const statusDotClass =
    connectionStatus === "connected"
      ? "bg-green-500 animate-pulse"
      : connectionStatus === "connecting"
      ? "bg-yellow-500 animate-pulse"
      : "bg-red-500";

  const canSend =
    connectionStatus === "connected" &&
    (!!message.trim() || !!imageUrl) &&
    !isImageUploading;

  return (
    <>
      {currentConv && (
        <CreateOfferModal
          open={offerModalOpen}
          onClose={() => setOfferModalOpen(false)}
          buyerId={currentConv.buyerUserId}
          buyerName={currentConv.seller}
        />
      )}

      <div className="border-b border-[#D8D8D8]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* ── Conversation Sidebar ── */}
          <div className="bg-white flex flex-col h-[calc(100vh-220px)] overflow-hidden border-r border-[#E8E4E4]">
            <div className="p-3 border-b bg-[#EFEFEF] flex flex-col gap-2 shrink-0">
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[#E8E4E4]">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name"
                  className="text-sm bg-transparent outline-none flex-1 text-gray-700 placeholder-gray-400"
                />
                <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1 rounded-md transition-colors">
                  Search
                </button>
              </div>
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${statusDotClass}`} />
                  <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                    {connectionStatus}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={connectWebSocket}
                  className="text-[10px] flex items-center gap-1 h-6 px-2"
                >
                  <RefreshCw className="w-3 h-3" /> Reconnect
                </Button>
              </div>
            </div>

            <div
              ref={sidebarListRef}
              onScroll={handleSidebarScrollLocal}
              className="flex-1 overflow-y-auto"
            >
              {conversations.length === 0 && !isLoadingMoreConversations && (
                <div className="p-6 text-center text-gray-400 text-sm">
                  <div className="text-3xl mb-2">📭</div>
                  No conversations yet
                </div>
              )}
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelect(conv)}
                  className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors border-b border-[#E8E4E4] border-l-4 ${
                    selectedId === conv.id
                      ? "bg-blue-50 border-l-blue-500"
                      : "border-l-transparent"
                  }`}
                >
                  <div className="mb-1">
                    <span className="inline-block text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {conv.time ? timeAgo(conv.time) : "—"}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <UserAvatar
                        src={conv.avatar}
                        name={conv.seller}
                        size={36}
                      />
                      {connectionStatus === "connected" && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {conv.seller || "Unknown Buyer"}
                        </p>
                        <p className="text-[11px] text-orange-500 font-medium shrink-0">
                          {conv.orderNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {(() => {
                          const lastMsg =
                            conv.messages[conv.messages.length - 1];
                          if (!lastMsg)
                            return (
                              <span className="text-xs text-gray-500 truncate">
                                {conv.product}
                              </span>
                            );
                          if (lastMsg.type === "offer")
                            return (
                              <span className="text-xs text-gray-500">
                                📦 Offer · $
                                {lastMsg.offerData?.totalPrice?.toLocaleString()}
                              </span>
                            );
                          if (lastMsg.imageUrl && !lastMsg.content)
                            return (
                              <span className="text-xs text-gray-500">
                                📷 Image
                              </span>
                            );
                          return (
                            <span className="text-xs text-gray-500 truncate">
                              {lastMsg.content || conv.product}
                            </span>
                          );
                        })()}
                        {conv.email && (
                          <>
                            <span className="text-gray-300 text-xs">·</span>
                            <span className="text-xs text-gray-400 truncate">
                              {conv.email}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge className="bg-blue-600 text-white text-[10px] min-w-[18px] h-5 flex items-center justify-center rounded-full px-1">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {isLoadingMoreConversations && (
                <div className="flex justify-center py-4">
                  <Spin size="small" />
                </div>
              )}
              {!hasMoreConversations && conversations.length > 0 && (
                <div className="text-center text-xs text-gray-400 py-3 flex items-center justify-center gap-1">
                  <ChevronDown className="w-3 h-3" />
                  All conversations loaded
                </div>
              )}
            </div>
          </div>

          {/* ── Chat Panel ── */}
          <div className="lg:col-span-2 bg-white flex flex-col h-[calc(100vh-220px)]">
            {currentConv ? (
              <>
                <div className="flex items-center px-5 py-3 mx-3 mt-3 rounded-xl bg-[#EEE] shrink-0">
                  <div className="relative mr-3">
                    <UserAvatar
                      src={currentConv.avatar}
                      name={currentConv.seller}
                      size={40}
                    />
                    {connectionStatus === "connected" && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">
                      {currentConv.seller}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusDotClass}`}
                      />
                      {connectionStatus === "connected"
                        ? "Active now"
                        : "Offline"}
                      {currentConv.email ? ` · ${currentConv.email}` : ""}
                    </p>
                  </div>
                  {currentConv.product && (
                    <span className="hidden sm:inline-flex text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5 mr-2 truncate max-w-[120px]">
                      {currentConv.product}
                    </span>
                  )}
                  <span className="ml-2 text-xs font-mono bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                    {currentConv.orderNumber}
                  </span>
                </div>

                <div
                  ref={messagesContainerRef}
                  onScroll={handleScrollTop}
                  className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gradient-to-b from-gray-50 to-gray-100"
                >
                  <LoadMoreIndicator
                    isFetching={isFetchingMore}
                    hasMore={msgHasMore}
                    messageCount={currentConv.messages.length}
                  />

                  {historyLoading && !initialLoaded && <MessageSkeleton />}

                  {!historyLoading &&
                    initialLoaded &&
                    currentConv.messages.length === 0 && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                            <span className="text-3xl">💬</span>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">
                            No messages yet. Start the conversation!
                          </p>
                        </div>
                      </div>
                    )}

                  {currentConv.messages.map((msg, index) => {
                    const prev = currentConv.messages[index - 1];
                    const next = currentConv.messages[index + 1];
                    const isSeller = msg.sender === "seller";

                    const showDate =
                      index === 0 ||
                      (msg.createdAt &&
                        prev?.createdAt &&
                        new Date(prev.createdAt).toDateString() !==
                          new Date(msg.createdAt).toDateString());

                    const isFirstInGroup =
                      !prev ||
                      prev.sender !== msg.sender ||
                      (msg.createdAt &&
                        prev.createdAt &&
                        new Date(msg.createdAt).getTime() -
                          new Date(prev.createdAt).getTime() >
                          120000);

                    const isLastInGroup =
                      !next ||
                      next.sender !== msg.sender ||
                      (next.createdAt &&
                        msg.createdAt &&
                        new Date(next.createdAt).getTime() -
                          new Date(msg.createdAt).getTime() >
                          120000);

                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-3">
                            <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                              {new Date(msg.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        )}

                        <div className={isFirstInGroup ? "mt-3" : "mt-0.5"}>
                          {msg.type === "offer" && msg.offerData ? (
                            <div
                              className={`flex items-end gap-2 ${
                                isSeller ? "justify-end" : "justify-start"
                              }`}
                            >
                              {!isSeller && isLastInGroup && (
                                <UserAvatar
                                  src={currentConv.avatar}
                                  name={currentConv.seller}
                                  size={32}
                                  className="mb-1 shrink-0"
                                />
                              )}
                              {!isSeller && !isLastInGroup && (
                                <div className="w-8 shrink-0" />
                              )}
                              <div className="flex flex-col">
                                <OfferCard
                                  offer={msg.offerData}
                                  isSeller={isSeller}
                                />
                                {isLastInGroup && (
                                  <span
                                    className={`text-[10px] text-gray-400 mt-1 ${
                                      isSeller ? "text-right" : "text-left"
                                    }`}
                                  >
                                    {msg.timestamp}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`flex items-end gap-2 ${
                                isSeller ? "justify-end" : "justify-start"
                              }`}
                            >
                              {!isSeller && isLastInGroup && (
                                <UserAvatar
                                  src={currentConv.avatar}
                                  name={currentConv.seller}
                                  size={32}
                                  className="mb-1 shrink-0"
                                />
                              )}
                              {!isSeller && !isLastInGroup && (
                                <div className="w-8 shrink-0" />
                              )}
                              <div className="flex flex-col max-w-xs md:max-w-sm lg:max-w-md">
                                <div
                                  className={`px-4 py-2.5 shadow-sm ${
                                    isSeller
                                      ? `bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl ${
                                          isLastInGroup ? "rounded-br-none" : ""
                                        }`
                                      : `bg-white text-gray-900 border border-slate-100 rounded-2xl ${
                                          isLastInGroup ? "rounded-bl-none" : ""
                                        }`
                                  }`}
                                >
                                  {msg.imageUrl && (
                                    <Image
                                      src={msg.imageUrl}
                                      alt="attachment"
                                      width={200}
                                      height={200}
                                      className="rounded-lg mb-2 max-w-[200px] object-cover"
                                    />
                                  )}
                                  {typeof msg.content === "string" &&
                                    msg.content.length > 0 && (
                                      <p className="text-sm break-words leading-relaxed whitespace-pre-wrap">
                                        {msg.content}
                                      </p>
                                    )}
                                </div>
                                {isLastInGroup && (
                                  <span
                                    className={`text-[10px] text-gray-400 mt-1 ${
                                      isSeller ? "text-right" : "text-left"
                                    }`}
                                  >
                                    {msg.timestamp}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}

                  {isTyping && (
                    <TypingIndicator
                      avatar={currentConv.avatar}
                      name={currentConv.seller}
                    />
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t bg-white shrink-0">
                  <div className="flex items-center gap-3 px-4 pt-3 pb-1">
                    <button
                      onClick={() => setOfferModalOpen(true)}
                      disabled={connectionStatus !== "connected"}
                      className="flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed border border-blue-200 hover:border-blue-300 transition-all px-3 py-1.5 rounded-full shadow-sm"
                    >
                      <MdLocalOffer className="text-blue-500" />
                      <span>Create offer</span>
                      <BsFillSendArrowUpFill className="text-blue-500" />
                    </button>
                  </div>

                  {selectedFile && (
                    <div className="mx-4 mb-2 flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
                      <Paperclip className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="text-xs text-gray-700 flex-1 truncate">
                        {selectedFile.name}
                      </span>
                      {isImageUploading ? (
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setImageUrl("");
                          }}
                        >
                          <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 px-4 pb-4 pt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={
                        isImageUploading || connectionStatus !== "connected"
                      }
                      className="text-gray-400 hover:text-blue-500 shrink-0"
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={
                        connectionStatus === "connected"
                          ? "Type a message…"
                          : "Connecting…"
                      }
                      className="flex-1 rounded-full px-4 border-gray-200 focus:border-blue-400 bg-[#F5F5F5]"
                      disabled={connectionStatus !== "connected"}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!canSend}
                      className="rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 shrink-0"
                    >
                      {isImageUploading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {connectionStatus !== "connected" && (
                    <p className="text-xs text-yellow-600 pb-2 text-center">
                      {connectionStatus === "connecting"
                        ? "● Connecting…"
                        : "● Disconnected — retrying…"}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1 text-gray-400">
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                    <span className="text-4xl">💬</span>
                  </div>
                  <p className="text-lg font-medium text-gray-600">
                    Select a conversation
                  </p>
                  <p className="text-sm text-gray-400">
                    Choose from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── B2BChatSeller (root) ─────────────────────────────────────────────────────
export function B2BChatSeller({
  conversationId,
  participant,
}: B2BChatSellerProps) {
  const token = useAppSelector((state: RootState) => state.auth.access_token);
  const userId = useAppSelector((state: RootState) => state.auth.user?.id);

  const {
    page: convPage,
    isFetching: convIsFetching,
    hasMore: convHasMore,
    loadNextPage,
    onPageLoaded,
  } = useConversationListPagination();

  const { data, isLoading, error } = useGetSellerB2BConversationsListQuery({
    page: convPage,
    limit: CONV_LIMIT,
  });

  const [allConversations, setAllConversations] = useState<Conversation[]>([]);

  const mapConv = useCallback(
    (conv: any): Conversation => ({
      id: conv.conversationId,
      buyerUserId: conv.participants?.userId ?? "",
      seller: conv.participants?.username ?? "Unknown Buyer",
      product: conv.topic || "B2B Conversation",
      orderNumber: `#${(conv.conversationId ?? "").slice(-8).toUpperCase()}`,
      time: conv.lastMessageTime ?? conv.updatedAt ?? "",
      avatar: conv.participants?.image ?? "",
      unreadCount: conv.unseen ?? 0,
      email: conv.participants?.email ?? "",
      messages: [],
    }),
    [],
  );

  useEffect(() => {
    if (!data?.result?.result) return;
    const incoming: Conversation[] = (data.result.result as any[]).map(mapConv);
    setAllConversations((prev) => {
      if (convPage === 1) return incoming;
      const existingIds = new Set(prev.map((c) => c.id));
      return [...prev, ...incoming.filter((c) => !existingIds.has(c.id))];
    });
    onPageLoaded(data.result.meta?.total ?? 0);
  }, [data, convPage, onPageLoaded, mapConv]);

  useEffect(() => {
    if (!conversationId || !participant) return;
    setAllConversations((prev) => {
      if (prev.some((c) => c.id === conversationId)) return prev;
      return [
        {
          id: conversationId,
          buyerUserId: participant.userId ?? "",
          seller: participant.username ?? "Unknown Buyer",
          product: "B2B Conversation",
          orderNumber: `#${conversationId.slice(-8).toUpperCase()}`,
          time: new Date().toISOString(),
          avatar: participant.image ?? "",
          unreadCount: 0,
          email: "",
          messages: [],
        },
        ...prev,
      ];
    });
  }, [conversationId, participant]);

  const handleLoadMore = useCallback(() => {
    loadNextPage();
  }, [loadNextPage]);

  if (!token) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 font-semibold">
        Token missing — please log in
      </div>
    );
  }

  if (isLoading && convPage === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading conversations…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Error loading conversations
      </div>
    );
  }

  return (
    <SidebarChat
      token={token}
      userId={userId}
      initialConversations={allConversations}
      initialSelectedId={conversationId}
      onLoadMoreConversations={handleLoadMore}
      isLoadingMoreConversations={convIsFetching}
      hasMoreConversations={convHasMore}
    />
  );
}

export default B2BChatSeller;