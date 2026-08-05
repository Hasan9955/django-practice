/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Avatar, Image } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { TiStar } from "react-icons/ti";
import { IoMdStarOutline } from "react-icons/io";
import { MdVerifiedUser } from "react-icons/md";

const getInitials = (fullName: string) =>
  fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const ReviewCard = ({ review }: { review: any }) => {
  const [avatarError, setAvatarError] = useState(false);

  const user = review.user ?? {};
  const fullName: string = user.fullName || "Anonymous";
  const profileImage: string = user.profileImage || "";
  const images: string[] = (review.image ?? []).filter(Boolean);
  const hasVideo = review.video?.trim();

  const showImageAvatar = profileImage && !avatarError;

  return (
    <div className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header: Avatar + Name + Badge */}
      <div className="flex items-center gap-3 mb-3">
        {/* Ant Design Avatar */}
        {showImageAvatar ? (
          <Avatar
            size={40}
            src={profileImage}
            onError={() => {
              setAvatarError(true);
              return true; // return true to show fallback
            }}
          />
        ) : fullName !== "Anonymous" ? (
          <Avatar
            size={40}
            style={{ backgroundColor: "#DBEAFE", color: "#1D4ED8" }}
          >
            {getInitials(fullName)}
          </Avatar>
        ) : (
          <Avatar size={40} icon={<UserOutlined />} />
        )}

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">
            {fullName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDate(review.createdAt)}
          </p>
        </div>

        <div className="flex items-center text-green-600 gap-1 text-xs bg-green-50 px-2 py-1 rounded-md flex-shrink-0">
          <MdVerifiedUser size={13} />
          <span>Verified</span>
        </div>
      </div>

      {/* Star Rating */}
      <div className="flex items-center text-[#FFDB0D] text-xl mb-3">
        {[...Array(5)].map((_, i) =>
          i < review.rating ? (
            <TiStar key={i} />
          ) : (
            <IoMdStarOutline key={i} className="text-gray-300" />
          )
        )}
        <span className="ml-2 text-sm text-gray-500 font-medium">
          {review.rating}.0
        </span>
      </div>

      {/* Comment */}
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        {review.comment}
      </p>

      {/* Ant Design Image with built-in Preview Group */}
      {images.length > 0 && (
        <Image.PreviewGroup>
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((src, i) => (
              <Image
                key={i}
                src={src}
                alt={`Review image ${i + 1}`}
                width={96}
                height={96}
                style={{ objectFit: "cover", borderRadius: 8 }}
                className="border border-gray-100"
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsisVrZM4er5jJxT0jeu+3mzzx9TPQrgSkktTgbSf4A4PbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3bMQEAAADCoPVP7WsIoEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAMBuAABHgAAAABJRU5ErkJggg=="
              />
            ))}
          </div>
        </Image.PreviewGroup>
      )}

      {/* Video */}
      {hasVideo && (
        <video
          src={review.video}
          controls
          className="w-full rounded-lg border border-gray-100 max-h-64 mt-1 bg-black"
        />
      )}
    </div>
  );
};

const Reviews = ({ reviews }: { reviews: any[] }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <p className="text-gray-500 py-10 text-center">
        No reviews available yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
};

export default Reviews;