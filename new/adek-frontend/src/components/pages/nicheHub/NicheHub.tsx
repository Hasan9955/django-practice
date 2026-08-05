/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PostCardProps } from "@/components/ui/Card/post-card";
import { Dialog, DialogContent } from "@/components/ui/Dialog/dialog";
import { ViewNewPostModal } from "@/components/ui/Modal/view-story-modal";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/Avatar/avatar";
import { useState } from "react";
import bannerimg from "@/assets/images/hub/Rectangle 34624238.jpg";
import { useGetNicheHubQuery } from "@/redux/features/niche_hub/nicheHubApi";
import PostCard from "@/components/ui/NicheHub/PostCard";

export default function NicheHub() {
  const [viewStoryOpen, setViewStoryOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // ✅ Fetch posts from API
  const { data: hubRes } = useGetNicheHubQuery({ search: "", filter: "" });
  const posts: PostCardProps[] = hubRes?.result?.data ?? [];

  // ✅ Filter posts created within the last 24 hours
  const now = new Date();
  const newPosts = posts.filter((post) => {
    if (!post.createdAt) return false;
    const createdAt = new Date(post.createdAt);
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24; // last 24 hours
  });

  return (
    <div className="min-h-screen  bg-gray-100 dark:bg-gray-950">
      {/* Header Section */}
      <header className="relative h-48 w-full overflow-hidden">
        <Image
          src={bannerimg}
          alt="NicheHub Banner"
          fill
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-5xl md:text-6xl font-bold">
            Niche <span className="text-orange-500">Hub</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className=" px-4 py-6 container mx-auto max-w-4xl">
        {/* ✅ New Post (Stories) Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">New Post</h2>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-4 pb-4">
              {newPosts.length > 0 ? (
                newPosts.map((post) => {
                  const isNew = true; // because all filtered are within 24h
                  return (
                    <button
                      key={post.id}
                      onClick={() => {
                        setSelectedPost(post);
                        setViewStoryOpen(true);
                      }}
                      className="flex flex-col items-center gap-1 focus:outline-none"
                    >
                      <div
                        className={`p-1 rounded-full ${
                          isNew
                            ? "bg-gradient-to-tr from-orange-500 to-pink-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <Avatar className="h-16 w-16 border-2 border-white">
                          <AvatarImage
                            src={
                              post.fileUrl?.[0] ||
                              "https://i.pravatar.cc/150?img=12"
                            }
                            alt={post.user?.fullName || "User"}
                            className="object-cover items-center "
                          />
                          <AvatarFallback>
                            {post.user?.fullName?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <span className="text-xs truncate w-16 text-center">
                        {post.user?.fullName || "User"}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm">No new posts yet.</p>
              )}
            </div>
          </ScrollArea>
        </section>

        {/* ✅ All Posts Feed */}
        <section className="space-y-6">
          {posts.map((post: any, index: number) => (
            <PostCard key={index} post={post} />
          ))}
        </section>
      </main>

      {/* ✅ Modal for viewing story/post */}
      <Dialog open={viewStoryOpen} onOpenChange={setViewStoryOpen}>
        <DialogContent>
          {selectedPost && (
            <ViewNewPostModal
              username={selectedPost.user?.fullName || "User"}
              post={selectedPost}
              onClose={() => setViewStoryOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
