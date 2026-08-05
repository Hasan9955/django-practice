"use client";

import { Card } from 'antd';
import { Calendar, Tag, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Promotion {
  id: string;
  name: string;
  category: string;
  promotionImage?: string | null;
  startDate: string;
  endDate: string;
  isPublished: boolean;
}

interface OfferCardProps {
  promotion: Promotion;
}

export default function OfferCard({ promotion }: OfferCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white">
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden group">
        {promotion.promotionImage ? (
          <Image
            src={promotion.promotionImage || "/placeholder.svg"}
            alt={promotion.name}
            height={400}
            width={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-blue-300">
            <ImageIcon className="w-12 h-12" />
            <span className="text-sm font-medium">No image</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            <Tag className="w-3 h-3" />
            {promotion.category}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-blue-900 mb-4 line-clamp-2 hover:text-blue-700 transition-colors">
          {promotion.name}
        </h3>

        {/* Dates */}
        <div className="space-y-2 mb-6 pb-6 border-b border-blue-100">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-gray-600">
                <span className="font-semibold text-gray-800">Start:</span> {formatDate(promotion.startDate)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-gray-600">
                <span className="font-semibold text-gray-800">End:</span> {formatDate(promotion.endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          {promotion.isPublished ? (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Inactive
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
