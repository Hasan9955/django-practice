/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import {
  useGetCommentsQuery,
  useToggleLikeNicheHubPostMutation,
  useCreateCommentMutation,
  useCreateShareMutation,
  useVoteInPollMutation,
  useCreateFollowMutation,
  useEditNicheHubPostMutation,
  useGetStoreFollowersQuery, // ← NEW: import the query hook
} from "@/redux/features/niche_hub/nicheHubApi";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { MediaGrid } from "@/components/pages/nicheHub/PostView";
import { ShareModal } from "@/components/pages/nicheHub/ShareModal";
import toast from "react-hot-toast";
import {
  Button,
  Form,
  Image,
  Input,
  Modal,
  Select,
  Skeleton,
  Spin,
  Switch,
  Upload,
} from "antd";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { useRouter } from "next/navigation";

interface Store {
  id: string;
  name?: string;
  shopName: string;
  bannerImage?: string;
  shopLogo: string;
}

interface PostUser {
  id: string;
  fullName: string;
  profileImage: string;
  store: Store[];
}

interface CommentUser {
  id: string;
  fullName: string;
  profileImage: string;
}

interface CommentReply {
  id: string;
  nicheHubId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  replies: CommentReply[];
}

interface Comment {
  id: string;
  nicheHubId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  replies: CommentReply[];
}

interface PollOption {
  id: string;
  pollId: string;
  text: string;
  voteCount: number;
}

interface Poll {
  id: string;
  nicheHubId: string;
  question: string;
  createdAt: string;
  updatedAt: string;
  options: PollOption[];
}

interface Post {
  id: string;
  title: string;
  fileUrl: string[];
  createdAt: string;
  likeCount: number;
  commentCount: number;
  productId?: string;
  visibility: "ALL" | "FOLLOWER";
  userId: string;
  Like: any[];
  user: PostUser;
  Poll: Poll[];
  isPublished?: boolean;
}

interface PostCardProps {
  post: Post;
}

enum Visibility {
  ALL = "ALL",
  FOLLOWER = "FOLLOWER",
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post?.Like?.length > 0);
  const [likeCount, setLikeCount] = useState(post?.likeCount);
  const [commentCount, setCommentCount] = useState(post?.commentCount);
  const [shareCount, setShareCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const user = useAppSelector((state: RootState) => state.auth.user);

  const [createFollow, { isLoading: isFollowing }] = useCreateFollowMutation();
  const [editNicheHubPost, { isLoading: isEditing }] =
    useEditNicheHubPostMutation();

  const nicheHubId = post?.id;
  const postuser = post?.user?.id;
  const currentuser = user?.id;

  // ─── Derive the store ID for this post ───────────────────────────────────
  const storeId = post?.user?.store?.[0]?.id;

  // ─── Fetch store followers (skip if no storeId or user is viewing own post)
  const { data: storeFollowersData, refetch: refetchFollowers } =
    useGetStoreFollowersQuery(storeId, {
      skip: !storeId || postuser === currentuser,
    });

  // ─── Derive whether current user already follows this store ──────────────
  // API response shape: { success, message, result: Follower[] }
  // Each Follower has: { id, followerId, storeId, follower: { id, fullName, profileImage } }
  const isAlreadyFollowing = useMemo(() => {
    const followers: any[] = storeFollowersData?.result ?? [];
    return followers.some((f) => f.followerId === currentuser);
  }, [storeFollowersData, currentuser]);

  const { data: commentsData, refetch: refetchComments } =
    useGetCommentsQuery(nicheHubId);
  const [toggleLike] = useToggleLikeNicheHubPostMutation();
  const [createComment] = useCreateCommentMutation();
  const [createShare] = useCreateShareMutation();
  const [voteInPoll] = useVoteInPollMutation();
  const router = useRouter();
  const comments: Comment[] = commentsData?.result?.data || [];

  const [form] = Form.useForm();

  useEffect(() => {
    setIsLiked(post?.Like?.length > 0);
    setLikeCount(post?.likeCount);
    setCommentCount(post?.commentCount);
  }, [post]);

  useEffect(() => {
    if (isEditModalOpen) {
      form.setFieldsValue({
        title: post?.title,
        visibility: post?.visibility,
        isPublished: post?.isPublished ?? true,
      });
      const existingFiles = post?.fileUrl.map((url, index) => ({
        uid: `-existing-${index}`,
        name: `image-${index}`,
        status: "done" as const,
        url,
      }));
      setFileList(existingFiles);
    }
  }, [isEditModalOpen, post, form]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleLike = async () => {
    try {
      await toggleLike(nicheHubId).unwrap();
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error: any) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleVote = async (optionId: string, pollId: string) => {
    try {
      await voteInPoll({ pollId, optionId }).unwrap();
    } catch (error) {
      console.error("Failed to vote in poll:", error);
    }
  };

  const handleShare = async () => {
    setIsShareOpen(true);
    try {
      await createShare({ nicheHubId: post?.id }).unwrap();
      setShareCount((prev) => prev + 1);
      if (navigator.share) {
        await navigator.share({
          title: post?.title || "Check out this post",
          text: post?.title || "Interesting post from NicheHub",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        console.log("Post link copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  const handleCommentsToggle = () => {
    setShowComments(!showComments);
    if (!showComments) {
      refetchComments();
    }
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim()) {
      try {
        await createComment({
          nicheHubId: post?.id,
          content: newComment,
        }).unwrap();
        setCommentCount((prev) => prev + 1);
        setNewComment("");
        refetchComments();
      } catch (error) {
        console.error("Failed to create comment:", error);
      }
    }
  };

  // ─── Follow / Unfollow handler (refetches followers to sync button state) ─
  const handleFollow = async () => {
    if (!storeId) {
      console.warn("Store ID not found");
      return;
    }
    try {
      await createFollow({ storeId }).unwrap();
      // Refetch followers so isAlreadyFollowing recalculates immediately
      refetchFollowers();
      toast.success(
        isAlreadyFollowing ? "Unfollowed" : "Followed successfully",
      );
    } catch (error) {
      console.error("Failed to follow/unfollow:", error);
      toast.error("Action failed. Please try again.");
    }
  };

  const handlePostEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append(
        "bodyData",
        JSON.stringify({
          title: values.title,
          visibility: values.visibility,
          isPublished: values.isPublished,
        }),
      );
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append(
            "galleryImages",
            file.originFileObj,
            file.originFileObj.name,
          );
        }
      });
      await editNicheHubPost({ postId: post.id, formData }).unwrap();
      toast.success("Post updated successfully");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to edit post:", error);
      toast.error("Failed to update post");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  // ─── Utilities ────────────────────────────────────────────────────────────

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  const visibleComments = showAllComments ? comments : comments?.slice(0, 2);

  const uploadProps: UploadProps = {
    fileList,
    multiple: true,
    listType: "picture",
    onChange: ({ fileList: newFileList }) => setFileList(newFileList),
    beforeUpload: () => false,
  };

  // ─── Render helpers ───────────────────────────────────────────────────────

  const renderMedia = () => {
    if (!post?.fileUrl?.length) return null;
    const firstMedia = post.fileUrl[0]?.split("?")[0];
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|avif)$/i;
    const videoExtensions = /\.(mp4|mkv|mov|webm)$/i;
    const isImage = imageExtensions.test(firstMedia ?? "");
    const isVideo = videoExtensions.test(firstMedia ?? "");
    return (
      <div className="relative mb-4 w-full overflow-hidden rounded-lg">
        {isVideo ? (
          <video
            controls
            preload="metadata"
            className="w-full max-h-[400px] rounded-lg object-fill bg-black"
            src={firstMedia}
          />
        ) : isImage ? (
          <Image
            src={firstMedia ?? ""}
            alt={post.title || "Post media"}
            width="100%"
            height={400}
            fallback="https://img.freepik.com/free-photo/red-hardcover-book-front-cover_1101-833.jpg"
            className="w-full max-h-[400px] rounded-lg object-contain"
          />
        ) : null}
      </div>
    );
  };

  const renderPoll = () => {
    if (post.Poll.length === 0) return null;
    const poll = post.Poll[0];
    const totalVotes = poll.options.reduce(
      (sum, opt) => sum + opt.voteCount,
      0,
    );
    return (
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold mb-3 text-gray-900">{poll.question}</h4>
        <div className="space-y-2">
          {poll.options.map((option) => {
            const percentage =
              totalVotes > 0
                ? Math.round((option.voteCount / totalVotes) * 100)
                : 0;
            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id, poll.id)}
                className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 bg-blue-100 opacity-50"
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative flex justify-between items-center">
                  <span className="font-medium">{option.text}</span>
                  <span className="text-sm text-gray-600">
                    {option.voteCount} votes ({percentage}%)
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">{totalVotes} total votes</p>
      </div>
    );
  };

  // ─── Follow button: only shown when NOT viewing your own post ────────────
  const renderFollowButton = () => {
    // Hide completely on own posts — Edit button handles that case
    if (postuser === currentuser) return null;

    return (
      <button
        onClick={handleFollow}
        disabled={isFollowing}
        className={`rounded-sm text-xs px-1.5 py-0.5 font-medium disabled:opacity-50 transition-colors duration-150 ${
          isAlreadyFollowing
            ? // "Following" state — outlined / muted style
              "border border-blue-700 text-blue-700 bg-white hover:bg-blue-50"
            : // "Follow" state — filled blue
              "text-white bg-blue-700 hover:bg-blue-800"
        }`}
      >
        {isFollowing ? (
          <Spin
            indicator={
              <LoadingOutlined
                style={{ color: isAlreadyFollowing ? "#1d4ed8" : "white" }}
                spin
              />
            }
            size="small"
          />
        ) : isAlreadyFollowing ? (
          "Following"
        ) : (
          "Follow"
        )}
      </button>
    );
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div className="mt-6 bg-white rounded-[16px] shadow-sm">
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            {post?.user?.store?.length > 0 &&
            post?.user?.store?.[0]?.shopLogo ? (
              <Image
                height={40}
                width={40}
                src={post.user.store[0].shopLogo}
                alt={`${post.user.store[0].shopName} avatar`}
                preview={false}
                className="w-10 h-10 rounded-full object-fill"
              />
            ) : post?.user?.profileImage ? (
              <Image
                height={40}
                width={40}
                src={post.user.profileImage}
                alt={`${post.user.fullName} avatar`}
                preview={false}
                className="w-10 h-10 rounded-full object-fill"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                {(post?.user?.store?.[0]?.shopName || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900">
                {post?.user?.store?.[0]?.shopName || post.user.fullName}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                {post.visibility.toLowerCase()}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-gray-500">
              {formatDate(post.createdAt)}
            </span>

            <div className="flex items-center gap-2 justify-center">
              {/* ── Follow / Following button (hidden on own posts) ── */}
              {renderFollowButton()}

              {/* ── Edit button (only visible on own posts) ── */}
              {postuser === currentuser && (
                <button
                  onClick={handlePostEdit}
                  disabled={isEditing}
                  className="hover:text-blue-800 text-xs px-1.5 py-0.5 bg-amber-500 text-black rounded-sm font-medium disabled:opacity-50"
                >
                  {isEditing ? (
                    <Spin indicator={<LoadingOutlined spin />} size="small" />
                  ) : (
                    "Edit"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Post Text */}
        {post.title && (
          <p className="text-gray-700 mb-4 leading-relaxed">{post.title}</p>
        )}

        {/* Media */}
        {post.fileUrl?.length > 1 ? (
          <MediaGrid fileUrl={post.fileUrl} />
        ) : (
          renderMedia()
        )}

        {/* Poll */}
        {renderPoll()}
      </div>

      {/* Engagement Bar */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors duration-200 ${
                isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">Like</span>
            </button>

            <button
              onClick={handleCommentsToggle}
              className={`flex items-center gap-2 transition-colors duration-200 ${
                showComments
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Comments</span>
            </button>

            <button
              onClick={() => handleShare()}
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>

          <div className="text-sm text-gray-500">
            <span>{likeCount} likes</span>
            <span className="mx-1">•</span>
            <span>{commentCount} comments</span>
            {shareCount > 0 && (
              <>
                <span className="mx-1">•</span>
                <span>{shareCount} shares</span>
              </>
            )}
            {post?.productId && (
              <Button
                type="primary"
                size="small"
                className="ml-2 font-mono font-bold"
                onClick={() => router.push(`/products/${post?.productId}`)}
              >
                Buy Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100">
          {comments.length > 2 && !showAllComments && (
            <div className="px-4 py-3 border-b border-gray-50">
              <button
                onClick={() => setShowAllComments(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all {comments.length} comments
              </button>
            </div>
          )}

          {comments.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {visibleComments.map((comment) => (
                <div
                  key={comment.id}
                  className="px-4 py-3 border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex gap-3">
                    {comment.user.profileImage ? (
                      <Image
                        width={32}
                        height={32}
                        src={comment.user.profileImage}
                        alt={`${comment.user.fullName} avatar`}
                        preview={false}
                        className="w-8 h-8 rounded-full object-fill flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {comment.user.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {comment.user.fullName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {comment.content}
                      </p>

                      {comment.replies.length > 0 && (
                        <div className="mt-3 ml-4 space-y-3 border-l-2 border-gray-200 pl-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              {reply.user.profileImage ? (
                                <Image
                                  width={28}
                                  height={28}
                                  src={reply.user.profileImage}
                                  alt={`${reply.user.fullName} avatar`}
                                  preview={false}
                                  className="w-7 h-7 rounded-full object-fill flex-shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                  {reply.user.fullName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900 text-sm">
                                    {reply.user.fullName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {getTimeAgo(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              No comments yet. Be the first to comment!
            </div>
          )}

          <div className="p-4 bg-gray-50">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <Image
                  width={32}
                  height={32}
                  src={user?.profileImage || ""}
                  alt="Current user avatar"
                  preview={false}
                  className="w-8 h-8 rounded-full object-fill flex-shrink-0"
                />
              </div>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 text-sm bg-white rounded-full border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                {newComment.trim() && (
                  <button
                    onClick={handleCommentSubmit}
                    className="text-blue-600 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        postId={post?.id}
        postTitle={post?.title}
        postImage={post?.fileUrl[0]}
        postUrl={post?.fileUrl[0]}
        userName={post?.user.fullName}
        userAvatar={post?.user.profileImage}
      />

      <Modal
        title="Edit Post"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Save"
        confirmLoading={isEditing}
        width={600}
      >
        {isEditing ? (
          <Skeleton active />
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="visibility"
              label="Visibility"
              rules={[{ required: true, message: "Please select visibility" }]}
            >
              <Select>
                <Select.Option value={Visibility.ALL}>ALL</Select.Option>
                <Select.Option value={Visibility.FOLLOWER}>
                  FOLLOWER
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="isPublished"
              label="Published"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item label="Gallery Images">
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Upload Images</Button>
              </Upload>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default PostCard;
