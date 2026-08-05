/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { DialogHeader, DialogTitle } from "../Dialog/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar/avatar";
import { Button } from "../Button/Button";

interface ViewNewPostModalProps {
  username: string;
  post: any;
  onClose: () => void;
}

export function ViewNewPostModal({
  username,
  post,
  onClose,
}: ViewNewPostModalProps) {
  return (
    <>
      <DialogHeader>
        <div className="flex flex-row items-center gap-2">
          <Avatar className="h-10 w-10 border">
            <AvatarImage
              src={post.user?.profileImage || "/placeholder-user.jpg"}
              alt={username}
            />
            <AvatarFallback>{username?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <DialogTitle>{username}&apos;s Post</DialogTitle>
        </div>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {post.title && (
          <p className="text-sm text-gray-800 dark:text-gray-200">
            {post.title}
          </p>
        )}

        {/* ✅ Show Image */}
        {post.fileUrl?.length > 0 && (
          <Image
            src={post.fileUrl[0]}
            width={400}
            height={300}
            alt="Post image"
            className="w-full h-auto object-cover rounded-md"
          />
        )}

        {/* ✅ Show Poll if exists */}
        {post.Poll?.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">{post.Poll[0].question}</h3>
            {post.Poll[0].options.map((opt: any) => (
              <div
                key={opt.id}
                className="flex items-center justify-between px-3 py-2 border rounded-md text-sm"
              >
                <span>{opt.text}</span>
                <span className="text-gray-500 text-xs">
                  {opt.voteCount} votes
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </>
  );
}
