"use client";

import { Skeleton } from "antd";
import { useGetSingleNicheHubPostQuery } from "@/redux/features/niche_hub/nicheHubApi";
import { useSearchParams } from "next/navigation";
import PostCard from "@/components/ui/NicheHub/PostCard";
export interface PostUser {
  id: string;
  fullName: string;
  profileImage: string;
  store?: Store[];
}

export interface Store {
  id: string;
  name: string;
  shopName: string;
  bannerImage: string;
  shopLogo: string;
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  voteCount: number;
}

export interface Poll {
  id: string;
  nicheHubId: string;
  question: string;
  createdAt: string;
  updatedAt: string;
  options: PollOption[];
}

export interface Like {
  id: string;
}

export interface Post {
  id: string;
  title: string;
  fileUrl: string[];
  createdAt: string;
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  isPublished?: boolean;
  visibility: "ALL" | "PRIVATE" | "FRIENDS" | "FOLLOWER";
  userId: string;
  Like: Like[];
  user: PostUser;
  Poll: Poll[];
}

export default function SocialFeedPage() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("id");

  const { data, isLoading, error } = useGetSingleNicheHubPostQuery(
    postId ?? "",
    {
      skip: !postId,
    },
  );

  const singlePost = data?.result;

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  if (error || !singlePost) {
    return (
      <div className="p-8 text-center text-red-600 font-medium">
        Post not found or failed to load
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Main Feed — full width on detail page */}
        <div className="lg:col-span-6">
          <div className="max-w-4xl mx-auto">
            <PostCard key={singlePost.id} post={singlePost} />
          </div>
        </div>

        {/* Analytics Sidebar — hidden on single-post detail view */}
        {/* <div className="lg:col-span-2">
          <AnalyticsDashboard />
        </div> */}
      </div>
    </div>
  );
}
