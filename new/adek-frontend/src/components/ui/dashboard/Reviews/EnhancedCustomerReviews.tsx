"use client";

import { useState, useEffect, useMemo } from "react";
import StatsCard from "./StatsCard";
import ReviewCard from "./ReviewCard";
import { useGetSellerReviewsQuery } from "@/redux/features/dashborad/sellerdashboard/sellerDashboardApi";
import { Skeleton } from "antd";
interface User {
  id: string;
  fullName: string;
  profileImage: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  image: string[];
  video: string;
  productId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
  user: User;
}

export default function EnhancedCustomerReviews() {
  const { data, isLoading } = useGetSellerReviewsQuery({});
  const reviews: Review[] = useMemo(() => data?.result?.data || [], [data]);

  const [filteredReviews, setFilteredReviews] = useState<Review[]>(reviews);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Calculate average rating
  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) /
    (reviews.length || 1);

  // Filter reviews by date
  useEffect(() => {
    if (!selectedDate) {
      setFilteredReviews(reviews);
      return;
    }

    const filtered = reviews.filter((review) => {
      const reviewDate = new Date(review.createdAt).toISOString().split("T")[0];
      return reviewDate === selectedDate;
    });

    setFilteredReviews(filtered);
  }, [selectedDate, reviews]);

  const handleDeleteReview = (id: string) => {
    setFilteredReviews(filteredReviews.filter((r) => r.id !== id));
  };

  const handleTogglePublic = (id: string) => {
    setFilteredReviews(
      filteredReviews.map((r) =>
        r.id === id ? { ...r, isPublic: !r.isPublic } : r,
      ),
    );
  };

  const formatNumber = (num: number) =>
    num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;

  const renderAverageStars = () => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            style={{
              color: i < Math.round(averageRating) ? "#FADB14" : "#E8E8E8",
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) return <Skeleton active />;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Average Rating"
          value={averageRating.toFixed(1)}
          subtitle="Rated by Customers"
        >
          {renderAverageStars()}
        </StatsCard>
        <StatsCard
          title="Total Reviews"
          value={formatNumber(reviews.length)}
          subtitle="What Our Customers Are Saying"
        />
        <div className="bg-white hidden rounded-lg p-6 shadow-sm">
          <h3 className="font-medium text-lg mb-3">Filter by</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded text-sm"
          />
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center text-gray-500 p-4">No reviews found.</div>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              id={review.id}
              name={review.user.fullName}
              avatar={review.user.profileImage}
              rating={review.rating}
              date={new Date(review.createdAt).toLocaleDateString()}
              totalSpent={0} // Placeholder, as API doesn't provide it
              totalReviews={0} // Placeholder
              text={review.comment}
              images={review.image}
              isPublic={true} // Placeholder
              onDelete={handleDeleteReview}
              onTogglePublic={handleTogglePublic}
            />
          ))
        )}
      </div>
    </div>
  );
}
