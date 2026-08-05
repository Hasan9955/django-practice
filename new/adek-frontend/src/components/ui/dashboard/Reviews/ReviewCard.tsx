"use client";
import Image from "next/image";

interface ReviewCardProps {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  totalSpent: number;
  totalReviews: number;
  text: string;
  images: string[];
  isPublic: boolean;
  onDelete: (id: string) => void;
  onTogglePublic: (id: string) => void;
}

export default function ReviewCard({
  id,
  name,
  avatar,
  rating,
  date,
  totalSpent,
  totalReviews,
  text,
  images,
  onDelete,
  onTogglePublic,
}: ReviewCardProps) {
  const renderStars = (rating: number) =>
    [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < rating ? "#FADB14" : "#E8E8E8" }}>
        ★
      </span>
    ));

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border-t border-gray-100">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 mb-4 md:mb-0">
          <div className="flex items-center mb-2">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <Image
                width={48}
                height={48}
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-medium">{name}</h4>
              <div className="flex items-center">
                {renderStars(rating)}
                <span className="ml-2 text-xs text-gray-500">{date}</span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>Total Spent: ${totalSpent}</p>
            <p>Total Reviews: {totalReviews}</p>
          </div>
        </div>

        <div className="md:w-3/4">
          <p className="text-gray-700 mb-4">{text}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="w-16 h-16 border border-gray-200 rounded overflow-hidden"
              >
                <Image
                  src={image}
                  width={64}
                  height={64}
                  alt={`Review ${index}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="hidden justify-end gap-2">
            <button
              onClick={() => onTogglePublic(id)}
              className="flex items-center gap-1 px-3 py-1 rounded border border-gray-200 text-sm text-gray-600"
            >
              Public
            </button>
            <button
              onClick={() => onDelete(id)}
              className="flex items-center gap-1 px-3 py-1 rounded border border-red-200 text-sm text-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
