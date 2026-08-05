/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useCallback, useEffect } from "react";
import { Modal, Button, Input, message } from "antd";
import { X, Star, ImagePlus, Video, Upload, CheckCircle } from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */

export interface ReviewSubmitPayload {
  orderId: string;
  rating: number;
  comment: string;
  images: File[];
  video: File | null;
}

interface ReviewModalProps {
  open: boolean;
  orderId: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: ReviewSubmitPayload) => Promise<void>;
}

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE_MB = 10;
const MAX_VIDEO_SIZE_MB = 100;

const RATING_LABELS: Record<number, string> = {
  1: "Terrible",
  2: "Poor",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

const RATING_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-red-50",    text: "text-red-600"    },
  2: { bg: "bg-orange-50", text: "text-orange-600" },
  3: { bg: "bg-yellow-50", text: "text-yellow-700" },
  4: { bg: "bg-blue-50",   text: "text-blue-700"   },
  5: { bg: "bg-green-50",  text: "text-green-700"  },
};

/* ─────────────────────────────────────────────
   Star Rating
───────────────────────────────────────────── */

interface StarRatingProps {
  value: number;
  onChange: (v: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform duration-100 hover:scale-110 focus:outline-none p-0.5"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`w-8 h-8 transition-all duration-150 ${
                star <= active
                  ? "fill-amber-400 stroke-amber-400 drop-shadow-sm"
                  : "fill-transparent stroke-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {value > 0 && (
        <span
          className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${
            RATING_COLORS[value].bg
          } ${RATING_COLORS[value].text}`}
        >
          {RATING_LABELS[value]}
        </span>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Photo Thumbnail
───────────────────────────────────────────── */

interface PhotoThumbProps {
  file: File;
  index: number;
  onRemove: (index: number) => void;
}

const PhotoThumb: React.FC<PhotoThumbProps> = ({ file, index, onRemove }) => {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`Review photo ${index + 1}`}
          className="w-full h-full object-cover"
        />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200" />

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-gray-200 hover:bg-red-50 hover:border-red-200"
        aria-label="Remove photo"
      >
        <X className="w-3 h-3 text-gray-600" />
      </button>

      {/* Index badge */}
      <span className="absolute bottom-1.5 left-1.5 text-[10px] font-medium bg-black/45 text-white rounded px-1.5 py-0.5">
        {index + 1}
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Drop Zone
───────────────────────────────────────────── */

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  disabled: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFiles, disabled }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      onFiles(files);
    },
    [disabled, onFiles]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  if (disabled) return null;

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
        dragging
          ? "border-blue-400 bg-blue-50"
          : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl mx-auto mb-2.5 flex items-center justify-center transition-colors ${
          dragging ? "bg-blue-100" : "bg-white border border-gray-200"
        }`}
      >
        <ImagePlus
          className={`w-5 h-5 transition-colors ${
            dragging ? "text-blue-500" : "text-gray-400"
          }`}
        />
      </div>
      <p
        className={`text-sm font-medium transition-colors ${
          dragging ? "text-blue-600" : "text-gray-600"
        }`}
      >
        Click to upload or drag &amp; drop
      </p>
      <p className="text-xs text-gray-400 mt-1">
        JPG, PNG, WEBP · Max {MAX_PHOTO_SIZE_MB}MB each
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────
   Review Modal — main component
───────────────────────────────────────────── */

const ReviewModal: React.FC<ReviewModalProps> = ({
  open,
  orderId,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);

  /* Reset state when modal closes */
  const handleClose = () => {
    setRating(0);
    setComment("");
    setImages([]);
    setVideo(null);
    onClose();
  };

  /* Photo handlers */
  const handleNewFiles = useCallback((files: File[]) => {
    const remaining = MAX_PHOTOS - images.length;
    if (remaining <= 0) {
      message.warning(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    const valid: File[] = [];
    for (const f of files) {
      if (f.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
        message.warning(`"${f.name}" exceeds ${MAX_PHOTO_SIZE_MB}MB and was skipped`);
        continue;
      }
      valid.push(f);
    }

    setImages((prev) => [...prev, ...valid].slice(0, MAX_PHOTOS));
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* Video handler */
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      message.warning(`Video must be under ${MAX_VIDEO_SIZE_MB}MB`);
      return;
    }
    setVideo(f);
    e.target.value = "";
  };

  /* Submit */
  const handleSubmit = async () => {
    if (!orderId) return;
    if (rating === 0) {
      message.warning("Please select a star rating");
      return;
    }
    await onSubmit({ orderId, rating, comment, images, video });
    handleClose();
  };

  const canSubmit = rating > 0;
  const photoCount = images.length;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={580}
      centered
      closeIcon={null}
      styles={{
        content: {
          padding: 0,
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
        },
        mask: {
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0,0,0,0.38)",
        },
      }}
    >
      <div className="font-nun flex flex-col" style={{ maxHeight: "90vh" }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Star className="w-4.5 h-4.5 fill-blue-500 stroke-blue-500" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#1C1C1E] leading-tight">
                Write a review
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Share your experience with this product
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div
          className="overflow-y-auto px-6 py-5 flex flex-col gap-5"
          style={{ maxHeight: "calc(90vh - 140px)" }}
        >

          {/* Rating */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Your rating <span className="text-red-400">*</span>
            </p>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="border-t border-gray-100" />

          {/* Comment */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Comment
            </p>
            <Input.TextArea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              showCount
              placeholder="What did you like or dislike? Your honest feedback helps others."
              style={{
                borderRadius: 10,
                fontSize: 13,
                resize: "none",
                fontFamily: "inherit",
                color: "#1C1C1E",
                borderColor: "#E5E7EB",
                backgroundColor: "#F9FAFB",
              }}
            />
          </div>

          <div className="border-t border-gray-100" />

          {/* Photos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Photos{" "}
                <span className="normal-case font-normal text-[11px]">(optional)</span>
              </p>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                  photoCount >= MAX_PHOTOS
                    ? "bg-amber-50 text-amber-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {photoCount} / {MAX_PHOTOS}
              </span>
            </div>

            {/* Drop zone — hidden when max reached */}
            <DropZone onFiles={handleNewFiles} disabled={photoCount >= MAX_PHOTOS} />

            {/* Thumbnail grid */}
            {photoCount > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {images.map((file, i) => (
                  <PhotoThumb
                    key={`${file.name}-${i}`}
                    file={file}
                    index={i}
                    onRemove={removeImage}
                  />
                ))}

                {/* "Add more" tile — shown when under limit */}
                {photoCount < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.multiple = true;
                      input.onchange = (e: any) => {
                        handleNewFiles(Array.from(e.target.files || []));
                      };
                      input.click();
                    }}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 flex flex-col items-center justify-center gap-1 transition-all duration-200 group"
                  >
                    <ImagePlus className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                    <span className="text-[10px] text-gray-300 group-hover:text-blue-400 font-medium transition-colors leading-tight text-center">
                      More
                    </span>
                  </button>
                )}

                {/* Empty placeholder slots for visual alignment */}
                {Array.from({
                  length: Math.max(
                    0,
                    MAX_PHOTOS - photoCount - (photoCount < MAX_PHOTOS ? 1 : 0)
                  ),
                }).map((_, i) => (
                  <div
                    key={`ph-${i}`}
                    className="aspect-square rounded-xl border border-dashed border-gray-100 bg-gray-50/50"
                  />
                ))}
              </div>
            )}

            <p className="text-[10px] text-gray-400 mt-2">
              JPG, PNG, WEBP · Max {MAX_PHOTO_SIZE_MB}MB each · Up to {MAX_PHOTOS} photos
            </p>
          </div>

          <div className="border-t border-gray-100" />

          {/* Video */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Video{" "}
              <span className="normal-case font-normal text-[11px]">(optional)</span>
            </p>

            {video ? (
              /* Video selected */
              <div className="flex items-center gap-3 p-3 rounded-xl border border-green-200 bg-green-50">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-700 truncate">
                    {video.name}
                  </p>
                  <p className="text-xs text-green-500 mt-0.5">
                    {(video.size / (1024 * 1024)).toFixed(1)} MB · click to change
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideo(null)}
                    className="w-6 h-6 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3 text-green-600" />
                  </button>
                </div>
              </div>
            ) : (
              /* Video upload trigger */
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all duration-200 group text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Upload className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                    Click to upload video
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    MP4, MOV · Max {MAX_VIDEO_SIZE_MB}MB
                  </p>
                </div>
                <Video className="w-4 h-4 text-gray-300 group-hover:text-blue-300 ml-auto transition-colors" />
              </button>
            )}

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoChange}
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-400">
            {canSubmit
              ? `${photoCount} photo${photoCount !== 1 ? "s" : ""} attached · ready to submit`
              : "Select a rating to continue"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleClose}
              className="font-nun font-medium text-gray-600 border-gray-200 hover:border-blue-300 rounded-lg h-9 px-4 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={isSubmitting}
              disabled={!canSubmit}
              onClick={handleSubmit}
              className={`font-nun font-semibold rounded-lg h-9 px-5 text-sm transition-all duration-200 ${
                canSubmit
                  ? "bg-blue-600 hover:bg-blue-700 border-blue-600"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              Submit review
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default ReviewModal;