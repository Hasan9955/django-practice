"use client";
import React, { useState, useRef } from "react";
import {
  Camera,
  BarChart3,
  X,
  Plus,
  Trash2,
  Globe,
  Users,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";
import { useCreateNicheHubPostMutation } from "@/redux/features/niche_hub/nicheHubApi";
import toast from "react-hot-toast";
import Image from "next/image";
import { useGetMyProfileQuery } from "@/redux/features/auth/authApi";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useGetMyStoreProductsQuery } from "@/redux/features/dashborad/products/productsApi";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface PollOption {
  id: string;
  text: string;
}

interface MediaFile {
  id: string;
  file: File;
  url: string;
  type: "image" | "video";
}

interface StoreProduct {
  id: string;
  productName: string;
  isPublished: boolean;
  totalSale: number;
  productStatus: string;
  productPhoto: string[];
}

type VisibilityType = "ALL" | "FOLLOWER";

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
const CreatePost = () => {
  /* ── core post state ── */
  const [postText, setPostText] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── poll state ── */
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ]);

  /* ── visibility state ── */
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [visibility, setVisibility] = useState<VisibilityType>("ALL");

  /* ── product picker state ── */
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(
    null,
  );

  /* ── refs ── */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── API hooks ── */
  const [createNicheHubPost] = useCreateNicheHubPostMutation();
  const { data: profileData } = useGetMyProfileQuery({});
  const sellerProfile = profileData?.result;

  const {
    data: productsData,
    isFetching: productsFetching,
    isError: productsError,
  } = useGetMyStoreProductsQuery(undefined, { skip: !showProductModal });

  // API response shape: { result: [{ Product: StoreProduct[] }] }
  const storeProducts: StoreProduct[] =
    productsData?.result?.[0]?.Product ?? [];

  /* ---------------------------------------------------------------- */
  /*  Handlers – media                                                  */
  /* ---------------------------------------------------------------- */
  const handleMediaClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        const newMedia: MediaFile = {
          id: Date.now().toString() + Math.random(),
          file,
          url,
          type: file.type.startsWith("image/") ? "image" : "video",
        };
        setMediaFiles((prev) => [...prev, newMedia]);
      }
    });
    // reset input so the same file can be re-selected
    e.target.value = "";
  };

  const removeMedia = (id: string) => {
    setMediaFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.url);
      return prev.filter((f) => f.id !== id);
    });
  };

  /* ---------------------------------------------------------------- */
  /*  Handlers – poll                                                   */
  /* ---------------------------------------------------------------- */
  const handlePollToggle = () => {
    setShowPoll((prev) => !prev);
    if (showPoll) {
      setPollQuestion("");
      setPollOptions([
        { id: "1", text: "" },
        { id: "2", text: "" },
      ]);
    }
  };

  const updatePollOption = (id: string, text: string) =>
    setPollOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text } : opt)),
    );

  const addPollOption = () => {
    if (pollOptions.length < 4)
      setPollOptions((prev) => [
        ...prev,
        { id: Date.now().toString(), text: "" },
      ]);
  };

  const removePollOption = (id: string) => {
    if (pollOptions.length > 2)
      setPollOptions((prev) => prev.filter((opt) => opt.id !== id));
  };

  /* ---------------------------------------------------------------- */
  /*  Handlers – visibility                                             */
  /* ---------------------------------------------------------------- */
  const visibilityOptions = [
    {
      value: "ALL" as VisibilityType,
      label: "Public",
      icon: Globe,
      desc: "Anyone can see this post",
    },
    {
      value: "FOLLOWER" as VisibilityType,
      label: "Followers",
      icon: Users,
      desc: "Only your followers can see this post",
    },
  ];

  const handleVisibilityChange = (val: VisibilityType) => {
    setVisibility(val);
    setShowVisibilityMenu(false);
  };

  const getCurrentVisibilityIcon = () =>
    visibilityOptions.find((o) => o.value === visibility)?.icon ?? Globe;

  /* ---------------------------------------------------------------- */
  /*  Handlers – product picker                                         */
  /* ---------------------------------------------------------------- */
  const handleSelectProduct = (product: StoreProduct) => {
    setSelectedProduct(product);
    setShowProductModal(false);
  };

  const removeSelectedProduct = () => setSelectedProduct(null);

  /* ---------------------------------------------------------------- */
  /*  Submit                                                            */
  /* ---------------------------------------------------------------- */
  const hasContent =
    postText.trim() !== "" ||
    mediaFiles.length > 0 ||
    selectedProduct !== null ||
    (showPoll &&
      pollQuestion.trim() !== "" &&
      pollOptions.some((opt) => opt.text.trim() !== ""));

  const handleSubmit = async () => {
    if (!hasContent) return;

    setIsLoading(true);
    setError(null);

    try {
      const postData = new FormData();

      const bodyData: Record<string, unknown> = {
        title: postText,
        isPublished: true,
        visibility: visibility || "ALL",
      };

      // ✅ Attach selected product id
      if (selectedProduct) {
        bodyData.productId = selectedProduct.id;
      }

      // ✅ Attach poll if present
      if (showPoll && pollQuestion.trim()) {
        bodyData.poll = {
          question: pollQuestion,
          options: pollOptions.map((o) => o.text).filter((t) => t.trim()),
        };
      }

      postData.append("bodyData", JSON.stringify(bodyData));

      // ✅ Attach media files
      mediaFiles.forEach((media) => {
        postData.append("galleryImages", media.file);
      });

      const response = await createNicheHubPost(postData).unwrap();
      if (response) toast.success("Post created successfully!");

      // ✅ Reset form
      setPostText("");
      setMediaFiles((prev) => {
        prev.forEach((f) => URL.revokeObjectURL(f.url));
        return [];
      });
      setShowPoll(false);
      setPollQuestion("");
      setPollOptions([
        { id: "1", text: "" },
        { id: "2", text: "" },
      ]);
      setSelectedProduct(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create post";
      setError(msg);
      toast.error(msg);
      console.error("Post creation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                            */
  /* ---------------------------------------------------------------- */
  return (
    <div>
      <div className="bg-white rounded-[16px] shadow-sm px-5 py-4">
        {/* ── Header: avatar + textarea ── */}
        <div className="flex w-full border-b border-black/10 pb-5 mb-5 items-center justify-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full">
            <Image
              src={sellerProfile?.sellerProfile || "/image.jpg"}
              alt="User Avatar"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Write your text"
              className="outline-none w-full resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* ── Media preview ── */}
        {mediaFiles.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {mediaFiles.map((media) => (
              <div key={media.id} className="relative group">
                {media.type === "image" ? (
                  <Image
                    src={media.url}
                    alt="Upload preview"
                    height={400}
                    width={800}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={media.url}
                    className="w-full h-40 object-cover rounded-lg"
                    controls
                  />
                )}
                <button
                  onClick={() => removeMedia(media.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Poll section ── */}
        {showPoll && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />
            {pollOptions.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updatePollOption(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {pollOptions.length > 2 && (
                  <button
                    onClick={() => removePollOption(option.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < 4 && (
              <button
                onClick={addPollOption}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 px-4 py-3 border rounded"
              >
                <Plus className="w-4 h-4" />
                Add option
              </button>
            )}
          </div>
        )}

        {/* ── Selected product preview ── */}
        {selectedProduct && (
          <div className="mb-4 flex items-center gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
            {selectedProduct.productPhoto[0] && (
              <Image
                src={selectedProduct.productPhoto[0]}
                alt={selectedProduct.productName}
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded-md flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {selectedProduct.productName}
              </p>
              <p className="text-xs text-gray-500">{selectedProduct.productStatus}</p>
            </div>
            <button
              onClick={removeSelectedProduct}
              className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
              title="Remove product"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Photo / Video */}
            <button
              onClick={handleMediaClick}
              disabled={isLoading}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 py-2 px-3 border rounded disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
              <span className="text-sm font-medium">Photo/Video</span>
            </button>

            {/* Poll */}
            <button
              onClick={handlePollToggle}
              disabled={isLoading}
              className={`flex items-center gap-2 py-2 px-3 border rounded disabled:opacity-50 ${
                showPoll
                  ? "text-blue-600 border-blue-300"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Poll</span>
            </button>

            {/* Add Product */}
            <button
              onClick={() => setShowProductModal(true)}
              disabled={isLoading}
              className={`flex items-center gap-2 py-2 px-3 border rounded disabled:opacity-50 ${
                selectedProduct
                  ? "text-blue-600 border-blue-300"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm font-medium">
                {selectedProduct ? "Product Added" : "Add Product"}
              </span>
            </button>

            {/* Visibility */}
            <div className="relative">
              <button
                onClick={() => setShowVisibilityMenu((v) => !v)}
                disabled={isLoading}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 py-2 px-3 border rounded disabled:opacity-50"
              >
                {React.createElement(getCurrentVisibilityIcon(), {
                  className: "w-5 h-5",
                })}
                <span className="text-sm font-medium">Visibility</span>
              </button>

              {showVisibilityMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border rounded shadow-lg z-10 min-w-[200px]">
                  {visibilityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleVisibilityChange(option.value)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 ${
                        visibility === option.value
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <option.icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">
                          {option.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Post button */}
          {hasContent && (
            <button
              onClick={handleSubmit}
              disabled={!hasContent || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center justify-center"
            >
              {isLoading ? (
                <Spin
                  indicator={
                    <LoadingOutlined style={{ color: "white" }} spin />
                  }
                  size="small"
                />
              ) : (
                "Post"
              )}
            </button>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* ── Hidden file input ── */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* ── Click-outside: visibility ── */}
      {showVisibilityMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowVisibilityMenu(false)}
        />
      )}

      {/* ================================================================
          Product Picker Modal
          ================================================================ */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-base font-semibold text-gray-800">
                Select a Product
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-4">
              {/* Loading */}
              {productsFetching && (
                <div className="flex justify-center items-center py-10">
                  <Spin
                    indicator={<LoadingOutlined spin />}
                    size="large"
                  />
                </div>
              )}

              {/* Error */}
              {productsError && !productsFetching && (
                <p className="text-center text-red-500 py-10 text-sm">
                  Failed to load products. Please try again.
                </p>
              )}

              {/* Empty */}
              {!productsFetching && !productsError && storeProducts.length === 0 && (
                <p className="text-center text-gray-400 py-10 text-sm">
                  No products found in your store.
                </p>
              )}

              {/* Product list */}
              {!productsFetching && !productsError && storeProducts.length > 0 && (
                <ul className="space-y-2">
                  {storeProducts.map((product) => {
                    const isSelected = selectedProduct?.id === product.id;
                    return (
                      <li key={product.id}>
                        <button
                          onClick={() => handleSelectProduct(product)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          {/* Product thumbnail */}
                          {product.productPhoto[0] ? (
                            <Image
                              src={product.productPhoto[0]}
                              alt={product.productName}
                              width={56}
                              height={56}
                              className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <ShoppingBag className="w-6 h-6 text-gray-400" />
                            </div>
                          )}

                          {/* Product info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {product.productName}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {product.productStatus} · {product.totalSale} sales
                            </p>
                          </div>

                          {/* Check icon */}
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-5 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {selectedProduct && (
                <button
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;