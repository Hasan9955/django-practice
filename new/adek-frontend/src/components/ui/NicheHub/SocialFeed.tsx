"use client";

import { Skeleton } from "antd";
import PostCard from "./PostCard";
import AnalyticsDashboard from "./AnalyticsDashboard";
import CreatePost from "./CreatePost";
import { useGetNicheHubQuery } from "@/redux/features/niche_hub/nicheHubApi";

export interface PostUser {
  id: string;
  fullName: string;
  profileImage: string;
  store: Store[];
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
  visibility: "ALL" | "FOLLOWER";
  userId: string;
  Like: Like[];
  user: PostUser;
  Poll: Poll[];
}

export default function SocialFeed() {
  const { data: postsData, isLoading } = useGetNicheHubQuery({});
  const posts: Post[] = postsData?.result?.data || [];

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 py-4 sm:py-5 md:py-6 xl:py-8">
      <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6 items-start">
        <div className="md:col-span-3 lg:col-span-4 min-w-0">
          {/* CreatePost sits above the feed */}
          <CreatePost />

          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            {isLoading ? (
              <>
                <Skeleton active className="mb-3 sm:mb-4" />
                <Skeleton active className="mb-3 sm:mb-4" />
                <Skeleton active />
              </>
            ) : posts.length === 0 ? (
              <div className="flex items-center justify-center min-h-[240px] sm:min-h-[320px] text-sm text-gray-400">
                No posts available
              </div>
            ) : (
              posts.map((post: Post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </div>

        <div className="md:col-span-2 md:sticky md:top-4 min-w-0">
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  );
}
