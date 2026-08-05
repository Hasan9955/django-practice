/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import Link from "next/link";

// import {
//   Bookmark,
//   FileWarning,
//   Heart,
//   MessageCircle,
//   MoreHorizontal,
//   Send,
//   Star,
// } from "lucide-react";
// import { useState } from "react";
// import { Card, CardContent, CardFooter, CardHeader } from "./Card";
// import { Avatar, AvatarFallback, AvatarImage } from "../Avatar/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../DropDownMenu/DropDownMenu";
// import { Button } from "../Button/Button";
// import { Input } from "../Input/Input";
// import { MediaGrid } from "@/components/pages/nicheHub/PostView";
// import { ShareModal } from "@/components/pages/nicheHub/ShareModal";

// // Type definitions
// interface User {
//   id: string;
//   fullName: string;
//   profileImage?: string;
// }

// interface Like {
//   userId: string;
//   postId: string;
// }

// interface Poll {
//   id: string;
//   question: string;
//   options: string[];
// }

// type Visibility = "public" | "private" | "friends";

// interface Comment {
//   user: string;
//   text: string;
// }

// export interface PostCardProps {
//   id?: string;
//   title?: string;
//   fileUrl?: string[];
//   createdAt?: string;
//   likeCount?: number;
//   commentCount?: number;
//   visibility?: Visibility;
//   userId?: string;
//   Like?: Like[];
//   user?: User;
//   Poll?: Poll[];
// }

// export function PostCard({
//   id = "",
//   title = "",
//   fileUrl = [],
//   createdAt = new Date().toISOString(),
//   likeCount = 0,
//   commentCount = 0,
//   visibility = "public",
//   userId = "",
//   Like = [],
//   user,
//   Poll = [],
// }: PostCardProps) {
//   // Safely get full name with fallback
//   const fullName = user?.fullName || "Anonymous";
//   const userAvatar = user?.profileImage || "/placeholder-user.jpg";
//   const userInitials = fullName.substring(0, 2).toUpperCase();

//   // Check if current user has liked the post
//   const [isLiked, setIsLiked] = useState(Like.length > 0);
//   const [currentLikes, setCurrentLikes] = useState(likeCount);
//   const [currentComments, setCurrentComments] = useState<Comment[]>([]);
//   const [newCommentText, setNewCommentText] = useState("");
//   const [showCommentInput, setShowCommentInput] = useState(false);
//   const [showAllComments, setShowAllComments] = useState(false);
//   const [replyingToCommentIndex, setReplyingToCommentIndex] = useState<
//     number | null
//   >(null);
//   const [replyText, setReplyText] = useState("");
//   const [isShareModalOpen, setIsShareModalOpen] = useState(false);

//   // Format the date
//   const formatDate = (dateString: string): string => {
//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffInMs = now.getTime() - date.getTime();
//       const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
//       const diffInDays = Math.floor(diffInHours / 24);

//       if (diffInHours < 1) return "Just now";
//       if (diffInHours < 24) return `${diffInHours}h ago`;
//       if (diffInDays < 7) return `${diffInDays}d ago`;
//       return date.toLocaleDateString();
//     } catch {
//       return "Recently";
//     }
//   };

//   const handleLike = () => {
//     if (isLiked) {
//       setCurrentLikes((prev) => Math.max(0, prev - 1));
//     } else {
//       setCurrentLikes((prev) => prev + 1);
//     }
//     setIsLiked(!isLiked);
//   };

//   const handleCommentButtonClick = () => {
//     setShowCommentInput(!showCommentInput);
//     setReplyingToCommentIndex(null);
//     setNewCommentText("");
//   };

//   const handleSubmitComment = () => {
//     if (newCommentText.trim() !== "") {
//       setCurrentComments([
//         ...currentComments,
//         { user: "You", text: newCommentText.trim() },
//       ]);
//       setNewCommentText("");
//       setShowCommentInput(false);
//       setShowAllComments(true);
//     }
//   };

//   const handleReplyClick = (index: number) => {
//     setReplyingToCommentIndex(index === replyingToCommentIndex ? null : index);
//     setReplyText("");
//     setShowCommentInput(false);
//   };

//   const handleSubmitReply = (commentUser: string) => {
//     if (replyText.trim() !== "") {
//       setCurrentComments([
//         ...currentComments,
//         { user: "You", text: `@${commentUser} ${replyText.trim()}` },
//       ]);
//       setReplyText("");
//       setReplyingToCommentIndex(null);
//       setShowAllComments(true);
//     }
//   };

//   const handleShare = () => {
//     setIsShareModalOpen(true);
//   };

//   // Generate post URL (adjust based on your routing)
//   const postUrl =
//     typeof window !== "undefined"
//       ? `${window.location.origin}/post/${id}`
//       : `https://yourdomain.com/post/${id}`;

//   const commentsToDisplay = showAllComments
//     ? currentComments
//     : currentComments.slice(0, 2);
//   const hasMoreComments = currentComments.length > 2 && !showAllComments;

//   const totalComments = commentCount + currentComments.length;

//   return (
//     <>
//       <Card className="w-full rounded-lg shadow-sm dark:bg-gray-900">
//         <CardHeader className="flex flex-row items-center p-4">
//           <Link
//             href={`/profile/${user?.id || ""}`}
//             className="flex items-center gap-2 text-sm font-semibold"
//           >
//             <Avatar className="h-8 w-8 border">
//               <AvatarImage
//                 src={userAvatar}
//                 alt={`@${fullName || "Anonymous"}`}
//               />
//               <AvatarFallback>{userInitials}</AvatarFallback>
//             </Avatar>
//             {fullName || "Anonymous"}
//           </Link>
//           <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
//             {formatDate(createdAt)}
//           </span>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="ml-auto h-8 w-8 rounded-full"
//               >
//                 <MoreHorizontal className="h-4 w-4" />
//                 <span className="sr-only">More options</span>
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem>
//                 <Bookmark className="mr-2 h-4 w-4" />
//                 Save
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <Star className="mr-2 h-4 w-4" />
//                 Add to favorites
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem>
//                 <FileWarning className="mr-2 h-4 w-4" />
//                 Report
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </CardHeader>
//         <CardContent className="p-0">
//           {title && (
//             <div className="px-4 pb-4 text-sm text-gray-800 dark:text-gray-200">
//               <p>{title}</p>
//             </div>
//           )}
//           <MediaGrid fileUrl={fileUrl} />
//         </CardContent>
//         <CardFooter className="grid gap-2 p-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <Button variant="ghost" size="icon" onClick={handleLike}>
//                 <Heart
//                   className={`h-4 w-4 ${
//                     isLiked ? "fill-red-500 text-red-500" : ""
//                   }`}
//                 />
//                 <span className="sr-only">Like</span>
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={handleCommentButtonClick}
//               >
//                 <MessageCircle className="h-4 w-4" />
//                 <span className="sr-only">Comment</span>
//               </Button>
//             </div>
//             <div className="flex items-center">
//               <Button variant="ghost" size="icon" onClick={handleShare}>
//                 <Send className="h-4 w-4" />
//                 <span className="sr-only">Share</span>
//               </Button>
//               <Button variant="ghost" size="icon">
//                 <Bookmark className="h-4 w-4" />
//                 <span className="sr-only">Save</span>
//               </Button>
//             </div>
//           </div>
//           <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
//             <span>
//               {currentLikes} Likes • {totalComments} Comments
//             </span>
//             {hasMoreComments && (
//               <Button
//                 variant="link"
//                 size="sm"
//                 onClick={() => setShowAllComments(true)}
//                 className="p-0 h-auto text-sm text-gray-500 dark:text-gray-400"
//               >
//                 View more comments
//               </Button>
//             )}
//           </div>
//           <div className="grid gap-3 text-sm">
//             {commentsToDisplay.map((comment, index) => (
//               <div key={index}>
//                 <div className="flex items-start gap-2">
//                   <Avatar className="h-7 w-7 border">
//                     <AvatarImage
//                       src="/placeholder-user.jpg"
//                       alt={`@${comment.user}`}
//                     />
//                     <AvatarFallback>
//                       {comment.user.substring(0, 2).toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="grid gap-0.5">
//                     <div className="flex items-center gap-1">
//                       <Link href="#" className="font-medium">
//                         {comment.user}
//                       </Link>
//                       <span className="text-gray-800 dark:text-gray-200">
//                         {comment.text}
//                       </span>
//                     </div>
//                     <Button
//                       variant="link"
//                       size="sm"
//                       onClick={() => handleReplyClick(index)}
//                       className="h-auto p-0 text-xs text-gray-500 dark:text-gray-400 flex items-start justify-start"
//                     >
//                       Reply
//                     </Button>
//                   </div>
//                 </div>
//                 {replyingToCommentIndex === index && (
//                   <div className="ml-9 mt-2 flex items-center gap-2">
//                     <Input
//                       placeholder={`Reply to ${comment.user}...`}
//                       className="flex-1"
//                       value={replyText}
//                       onChange={(e) => setReplyText(e.target.value)}
//                       onKeyPress={(e) => {
//                         if (e.key === "Enter") {
//                           handleSubmitReply(comment.user);
//                         }
//                       }}
//                     />
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => handleSubmitReply(comment.user)}
//                     >
//                       <Send className="h-4 w-4" />
//                       <span className="sr-only">Send reply</span>
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//           {showCommentInput && (
//             <div className="flex items-center gap-2 pt-2">
//               <Avatar className="h-8 w-8 border">
//                 <AvatarImage src="/placeholder-user.jpg" alt="Your avatar" />
//                 <AvatarFallback>YO</AvatarFallback>
//               </Avatar>
//               <Input
//                 placeholder={`Comment as ${fullName}`}
//                 className="flex-1"
//                 value={newCommentText}
//                 onChange={(e) => setNewCommentText(e.target.value)}
//                 onKeyPress={(e) => {
//                   if (e.key === "Enter") {
//                     handleSubmitComment();
//                   }
//                 }}
//               />
//               <Button variant="ghost" size="icon" onClick={handleSubmitComment}>
//                 <Send className="h-4 w-4" />
//                 <span className="sr-only">Send comment</span>
//               </Button>
//             </div>
//           )}
//         </CardFooter>
//       </Card>

//       {/* Share Modal */}
//       <ShareModal
//         isOpen={isShareModalOpen}
//         onClose={() => setIsShareModalOpen(false)}
//         postId={id}
//         postTitle={title}
//         postImage={fileUrl.length > 0 ? fileUrl[0] : undefined}
//         postUrl={postUrl}
//         userName={fullName}
//         userAvatar={userAvatar}
//       />
//     </>
//   );
// }


/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Bookmark,
  FileWarning,
  Star,
} from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader } from "./Card";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../DropDownMenu/DropDownMenu";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { MediaGrid } from "@/components/pages/nicheHub/PostView";
import { ShareModal } from "@/components/pages/nicheHub/ShareModal";

import {
  useToggleLikeNicheHubPostMutation,
  useGetLikeUserNicheHubPostQuery,
  useCreateCommentMutation,
  useGetCommentsQuery,
  useCreateShareMutation,
  useGetSharesQuery,
  useCreateFollowMutation,
  useGetMyFollowingsQuery,
} from "@/redux/features/niche_hub/nicheHubApi";

import { formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// === TYPES ===
interface User {
  id: string;
  fullName: string;
  profileImage?: string;
}

export interface PostCardProps {
  id: string;
  title?: string;
  content?: string;
  fileUrl?: string[];
  createdAt: string;
  user?: User;
  storeId?: string;
  onClick?: () => void;
}

export function PostCard({
  id,
  title,
  content,
  fileUrl = [],
  createdAt,
  user,
  storeId,
  onClick,
}: PostCardProps) {
  const fullName = user?.fullName || "Anonymous";
  const userAvatar = user?.profileImage || "/placeholder-user.jpg";
  const userInitials = fullName.substring(0, 2).toUpperCase();

  // === RTK HOOKS ===
  const [toggleLike] = useToggleLikeNicheHubPostMutation();
  const { data: likeData } = useGetLikeUserNicheHubPostQuery(id);
  const { data: commentsData } = useGetCommentsQuery(id);
  const [createComment] = useCreateCommentMutation();
  const [createShare] = useCreateShareMutation();
  const { data: sharesData } = useGetSharesQuery(id);
  const [createFollow] = useCreateFollowMutation();
  const { data: followingsData } = useGetMyFollowingsQuery({});

  // === STATE ===
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // === DERIVED DATA ===
  const likes = likeData?.result?.data ?? [];
  const likeCount = likes.length;
  const isLiked = likes.some((l: any) => l.isCurrentUser);

  const comments = commentsData?.result?.data ?? [];
  const commentCount = comments.length;

  const shareCount = sharesData?.result?.data?.length ?? 0;

  const isFollowing = storeId
    ? followingsData?.result?.data?.some((f: any) => f.storeId === storeId)
    : false;

  // === FORM ===
  const commentSchema = z.object({ content: z.string().min(1) });
  type CommentForm = z.infer<typeof commentSchema>;
  const { register, handleSubmit, reset, setValue } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
  });

  // === HANDLERS ===
  const handleLike = () => toggleLike(id);

  const onSubmitComment = async (data: CommentForm) => {
    if (replyingTo) {
      await createComment({
        nicheHubId: id,
        parentId: replyingTo,
        content: data.content,
      });
    } else {
      await createComment({ nicheHubId: id, content: data.content });
    }
    reset();
    setReplyingTo(null);
    setShowCommentInput(false);
  };

  const handleShare = () => {
    createShare({ postId: id });
    setIsShareModalOpen(true);
  };

  const handleFollow = () => {
    if (storeId) createFollow({ storeId });
  };

  const postUrl = `${window.location.origin}/post/${id}`;

  return (
    <>
      <Card
        className="w-full rounded-lg shadow-sm dark:bg-gray-900 cursor-pointer hover:shadow-md transition-shadow"
        onClick={(e) => {
          if (!e.defaultPrevented && onClick) onClick();
        }}
      >
        <CardHeader className="flex flex-row items-center p-4 gap-3">
          <Link
            href={`/profile/${user?.id || ""}`}
            className="flex items-center gap-2 text-sm font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={userAvatar} alt={fullName} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{fullName}</div>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </div>
            </div>
          </Link>

          {storeId && (
            <Button
              variant={isFollowing ? "secondary" : "default"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleFollow();
              }}
              className="ml-auto"
            >
              {isFollowing ? "Following" : "Follow Store"}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Bookmark className="mr-2 h-4 w-4" /> Save
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="mr-2 h-4 w-4" /> Add to favorites
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <FileWarning className="mr-2 h-4 w-4" /> Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="p-0">
          {(title || content) && (
            <div className="px-4 pb-3 text-sm">
              <p>{title || content}</p>
            </div>
          )}
          {fileUrl.length > 0 && <MediaGrid fileUrl={fileUrl} />}
        </CardContent>

        <CardFooter className="p-4 space-y-3">
          {/* Like & Comment Counts */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                {likeCount}
              </span>
              <span>{commentCount} Comments</span>
              <span>{shareCount} Shares</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-2">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 ${isLiked ? "text-red-500" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            >
              <Heart className={`w-5 h-5 mr-1 ${isLiked ? "fill-current" : ""}`} />
              Like
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentInput(!showCommentInput);
              }}
            >
              <MessageCircle className="w-5 h-5 mr-1" />
              Comment
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
            >
              <Send className="w-5 h-5 mr-1" />
              Share
            </Button>
          </div>

          {/* Comments */}
          <div className="space-y-3 pt-2">
            {comments.slice(0, 3).map((comment: any) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                postId={id}
                onReply={() => setReplyingTo(comment._id)}
                replyingTo={replyingTo}
                setValue={setValue}
              />
            ))}
            {comments.length > 3 && (
              <Button
                variant="link"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
              >
                View all {comments.length} comments
              </Button>
            )}
          </div>

          {/* Comment Input */}
          {showCommentInput && (
            <form
              onSubmit={handleSubmit(onSubmitComment)}
              className="flex items-center gap-2 pt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>YO</AvatarFallback>
              </Avatar>
              <Input
                {...register("content")}
                placeholder={
                  replyingTo ? "Write a reply..." : `Comment as ${fullName}...`
                }
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}
        </CardFooter>
      </Card>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        postId={id}
        postTitle={title ?? content ?? ""}
        postImage={fileUrl[0]}
        postUrl={postUrl}
        userName={fullName}
        userAvatar={userAvatar}
      />
    </>
  );
}

/* ================================
   NESTED COMMENT ITEM (with reply)
   ================================ */
function CommentItem({
  comment,
  postId,
  onReply,
  replyingTo,
  setValue,
}: {
  comment: any;
  postId: string;
  onReply: () => void;
  replyingTo: string | null;
  setValue: any;
}) {
  const isReplying = replyingTo === comment._id;

  return (
    <div className="flex gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user?.profileImage} />
        <AvatarFallback>{comment.user?.fullName?.[0] || "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
          <Link href="#" className="font-medium text-sm">
            {comment.user?.fullName || "User"}
          </Link>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="flex gap-3 mt-1 text-xs text-gray-500">
          <button className="hover:underline" onClick={onReply}>
            Reply
          </button>
          <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
        </div>

        {/* Reply Input */}
        {isReplying && (
          <div className="mt-2 flex gap-2 items-center">
            <Input
              placeholder="Write a reply..."
              className="flex-1 text-sm"
              onChange={(e) => setValue("content", e.target.value)}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                // Submit handled by parent form
              }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Render replies */}
        {comment.replies?.map((reply: any) => (
          <div key={reply._id} className="ml-10 mt-2">
            <CommentItem
              comment={reply}
              postId={postId}
              onReply={() => {}}
              replyingTo={null}
              setValue={setValue}
            />
          </div>
        ))}
      </div>
    </div>
  );
}