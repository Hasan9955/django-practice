/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Copy,
  MessageCircle,
  Check,
  Send,
  Instagram,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/Avatar/avatar";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";

// React Share imports
import {
  FacebookShareButton,
  FacebookShareCount,
  TwitterShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  EmailShareButton,
  InstapaperShareButton,
} from "react-share";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  postImage?: string;
  postUrl: string;
  userName: string;
  userAvatar?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  postId,
  postTitle,
  postImage,
  postUrl,
  userName,
  userAvatar,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareText, setShareText] = useState("");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareUrl = postUrl;
  const title = shareText || postTitle;
  const hashtags = ["#MyApp", "#SharePost"]; // Customize
  const related = ["YourAppAccount"]; // Customize

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
          <DialogDescription>
            Share this post to your favorite social platforms
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post Preview */}
          <div className="rounded-lg border p-3 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={userAvatar || "/placeholder-user.jpg"}
                  alt={userName}
                />
                <AvatarFallback>
                  {userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{userName}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {postTitle}
            </p>
            {postImage && (
              <Image
                width={400}
                height={96}
                src={postImage}
                alt="Post preview"
                className="mt-2 rounded w-full h-24 object-cover"
              />
            )}
          </div>

          {/* Optional Share Text */}
          <div>
            <Input
              placeholder="Add a message (optional)"
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Social Buttons Grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Facebook */}
            <FacebookShareButton
              url={shareUrl}
              title={title}
              hashtag={hashtags[0]}
            >
              <div className="flex flex-col items-center gap-2 h-auto py-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs">Facebook</span>
                <FacebookShareCount url={shareUrl}>
                  {(count) => (
                    <span className="text-[10px] text-gray-500">
                      {count || 0}
                    </span>
                  )}
                </FacebookShareCount>
              </div>
            </FacebookShareButton>

            {/* Twitter */}
            <TwitterShareButton
              url={shareUrl}
              title={title}
              hashtags={hashtags.map((h) => h.replace("#", ""))}
              related={related}
            >
              <div className="flex flex-col items-center gap-2 h-auto py-3">
                <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
                  <Twitter className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs">Twitter</span>
              </div>
            </TwitterShareButton>



            {/* WhatsApp */}
            <WhatsappShareButton url={shareUrl} title={title} separator=" - ">
              <div className="flex flex-col items-center gap-2 h-auto py-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs">WhatsApp</span>
              </div>
            </WhatsappShareButton>


          </div>

          {/* Copy Link Section */}
          <div className="pt-2">
            <div className="flex items-center gap-2">
              <Input
                value={postUrl}
                readOnly
                className="flex-1 bg-gray-50 dark:bg-gray-800"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className={copied ? "bg-green-50 dark:bg-green-900" : ""}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1 text-center">
                Link copied to clipboard!
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
