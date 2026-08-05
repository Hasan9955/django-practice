import { IPaginationOptions } from "../../../interfaces/paginations";
import { fileUploadQueue } from "../../../queues/fileQueue";
import { paginationHelper } from "../../../shared/pagination";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { deleteFromS3ByUrl } from "../../../utlits/deleteFromS3";
import { Visibility } from "@prisma/client";

const createNicheHubPost = async (userId: string, payload: any, files: any) => {
  const { title, isPublished, visibility, poll, productId } = payload;

  const existingSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      subscription: true,
    },
  });

  const getThisMonthPostCount = await prisma.nicheHub.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  });

  if (!existingSubscription && getThisMonthPostCount >= 5) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You have reached the limit 5 for this month. upgrade your subscription plan to continue.",
    );
  }

  if (existingSubscription?.subscription?.type === "FREE" && getThisMonthPostCount >= 5) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You have reached the limit 5 for this month. upgrade your subscription plan to continue.",
    );
  }

  if (
    existingSubscription?.subscription?.type === "STARTERPRO" &&
    getThisMonthPostCount >= 30
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You have reached the limit 30 for this month. upgrade your subscription plan to continue.",
    );
  }


  const post = await prisma.nicheHub.create({
    data: {
      userId,
      title,
      visibility,
      fileUrl: [],
      isPublished: isPublished ?? true,
      productId: productId ?? null,
      Poll: poll
        ? {
          create: {
            question: poll.question,
            options: {
              create: poll.options.map((opt: string) => ({ text: opt })),
            },
          },
        }
        : undefined,
    },
    include: {
      Poll: { include: { options: true } },
    },
  });

  if (files && Object.keys(files).length > 0) {
    const filesArray: Express.Multer.File[] = Array.isArray(files)
      ? files
      : (Object.values(files).flat() as Express.Multer.File[]);

    // Add to queue (pass file path, mimetype, originalname only)
    await fileUploadQueue.add("file-upload", {
      postId: post.id,
      files: filesArray.map((f) => ({
        path: f.path,
        mimetype: f.mimetype,
        originalname: f.originalname,
      })),
    });
  }

  return post;
};

// const getAllNicheHubPosts = async (
//   userId: string,
//   options: IPaginationOptions & { search?: string; filter?: string },
// ) => {
//   const { page, limit, skip } = paginationHelper.calculatePagination(options);
//   const { search, filter } = options;

//   const where: any = {
//     isPublished: true,
//   };

//   // Search filter
//   if (search) {
//     where.title = { contains: search, mode: "insensitive" };
//   }

//   // Only user's posts
//   if (filter === "user") {
//     where.userId = userId;
//   }

//   // Fetch all published posts
//   const posts = await prisma.nicheHub.findMany({
//     skip,
//     take: limit,
//     orderBy: { createdAt: "desc" },
//     select: {
//       id: true,
//       title: true,
//       fileUrl: true,
//       createdAt: true,
//       likeCount: true,
//       productId: true,
//       commentCount: true,
//       visibility: true,
//       userId: true,
//       Like: {
//         where: { userId },
//         select: { id: true },
//       },
//       user: {
//         select: {
//           id: true,
//           fullName: true,
//           profileImage: true,
//           store: {
//             select: {
//               id: true,
//               name: true,
//               shopName: true,
//               bannerImage: true,
//               shopLogo: true,
//               Follow:{
//                 where: { followerId: userId},
//                 select: { followerId: true }
//               }
//             },
//           },
//         },
//       },
//       Poll: {
//         include: {
//           options: true,
//         },
//       },
//     },
//   });

//   // Get all user followings
//   const followingList = await prisma.follow.findMany({
//     where: { followerId: userId },
//     select: { followerId: true },
//   });

//   const followingIds = followingList.map((f) => f.followerId);

//   // Filter visibility
//   const visiblePosts = posts.filter((post) => {
//     if (post.visibility === "ALL") return true;
//     if (post.visibility === "FOLLOWER" && followingIds.includes(post.userId))
//       return true;
//     if (post.userId === userId) return true; // always show user’s own post
//     return false;
//   });

//   const total = visiblePosts.length;

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//       totalPage: Math.ceil(total / limit),
//     },
//     data: visiblePosts,
//   };
// };

const getAllNicheHubPosts = async (
  userId: string,
  options: IPaginationOptions & { search?: string; filter?: string },
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { search, filter } = options;

  // Get user's following IDs first
  const followingList = await prisma.follow.findMany({
    where: { followerId: userId },
    select: {
      store: {
        select: {
          sellerId: true
        }
      }
    }, // Fixed: should be followingId, not followerId
  });

  const followingIds = followingList.map((f) => f?.store?.sellerId);

  // First, get the list of users that the current user has blocked
  const blockedUsers = await prisma.blockUser.findMany({
    where: {
      userId: userId, // Current user is the blocker
    },
    select: {
      blockedId: true,
    }
  });

  const blockedUserIds = blockedUsers.map(block => block.blockedId);

  // Build the where clause with proper visibility filtering
  const where: any = {
    isPublished: true,
    OR: [
      // Visibility ALL - anyone can see
      { visibility: "ALL" },
      // Visibility FOLLOWER - only if user follows the post author
      {
        visibility: "FOLLOWER",
        userId: { in: followingIds }
      },
      // User's own posts - always visible
      { userId: userId }
    ],
    // Exclude posts reported by the user
    reportNicheHubs: {
      none: { userId: userId }
    },
    // 🆕 Exclude posts from blocked users
    userId: {
      notIn: blockedUserIds
    }
  };

  // Apply search filter
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  // Apply user filter (only show user's own posts)
  if (filter === "user") {
    // Override the visibility condition to only show user's posts
    where.userId = userId;
    delete where.OR; // Remove the OR condition when filtering by user
  }

  // Get total count with the same filters
  const total = await prisma.nicheHub.count({ where });

  // Fetch paginated posts
  const posts = await prisma.nicheHub.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      createdAt: true,
      likeCount: true,
      productId: true,
      commentCount: true,
      visibility: true,
      userId: true,
      Like: {
        where: { userId },
        select: { id: true },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
          store: {
            select: {
              id: true,
              name: true,
              shopName: true,
              bannerImage: true,
              shopLogo: true,
              Follow: {
                where: { followerId: userId },
                select: { followerId: true }
              }
            },
          },
        },
      },
      Poll: {
        include: {
          options: true,
        },
      },
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: posts,
  };
};

const getAllNicheHubDataForAdmin = async (
  userId: string,
  options: IPaginationOptions & { search?: string; filter?: string },
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { search, filter } = options;
  
  const where: any = {
    isPublished: true, 
  };

  // Apply search filter
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  // Apply user filter (only show user's own posts)
  if (filter === "user") {
    // Override the visibility condition to only show user's posts
    where.userId = userId; 
  }

  // Get total count with the same filters
  const total = await prisma.nicheHub.count({ where });

  // Fetch paginated posts
  const posts = await prisma.nicheHub.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      createdAt: true,
      likeCount: true,
      productId: true,
      commentCount: true,
      visibility: true,
      userId: true,
      Like: {
        where: { userId },
        select: { id: true },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
          store: {
            select: {
              id: true,
              name: true,
              shopName: true,
              bannerImage: true,
              shopLogo: true,
              Follow: {
                where: { followerId: userId },
                select: { followerId: true }
              }
            },
          },
        },
      },
      Poll: {
        include: {
          options: true,
        },
      },
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: posts,
  };
};


const blockAUser = async (userId: string, blockedId: string) => {

  const existingBlock = await prisma.blockUser.findFirst({
    where: {
      userId: userId,
      blockedId: blockedId
    }
  })

  if (existingBlock) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already blocked')
  }


  const res = await prisma.blockUser.create({
    data: {
      userId: userId,
      blockedId: blockedId
    }
  })

  return res

}


const getSingleNicheHubPost = async (postId: string) => {
  const post = await prisma.nicheHub.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
          store: {
            select: {
              id: true,
              name: true,
              shopName: true,
              bannerImage: true,
              shopLogo: true,
            },
          },
        },
      },
      Poll: { include: { options: true } },
    },
  });

  return post;
};

const updateNicheHubPost = async (
  postId: string,
  userId: string,
  payload: any,
  files: any,
) => {
  const { title, isPublished, visibility, poll, productId } = payload;

  const post = await prisma.nicheHub.findUnique({
    where: {
      id: postId,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, "Post not found");
  }

  if (user?.role !== "ADMIN" && post.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to update this post",
    );
  }

  if (files) {
    await Promise.all(post.fileUrl.map((url) => deleteFromS3ByUrl(url)));
  }
  const updatedPost = await prisma.nicheHub.update({
    where: {
      id: postId,
    },
    data: {
      title,
      visibility,
      productId: productId ?? post.productId,
      isPublished: isPublished ?? true,
      Poll: poll
        ? {
          create: {
            question: poll.question,
            options: {
              create: poll.options.map((opt: string) => ({ text: opt })),
            },
          },
        }
        : undefined,
    },
    include: {
      Poll: { include: { options: true } },
    },
  });

  if (files && Object.keys(files).length > 0) {
    const filesArray: Express.Multer.File[] = Array.isArray(files)
      ? files
      : (Object.values(files).flat() as Express.Multer.File[]);
    await fileUploadQueue.add("file-upload", {
      postId: post.id,
      files: filesArray.map((f) => ({
        path: f.path,
        mimetype: f.mimetype,
        originalname: f.originalname,
      })),
    });
  }

  return updatedPost;
};


const deleteNicheHubPost = async (postId: string, userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const post = await prisma.nicheHub.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, "Post not found");
  }

  if (user.role !== "ADMIN" && post.userId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to delete this post",
    );
  }

  await Promise.all(post.fileUrl.map((url) => deleteFromS3ByUrl(url)));

  await prisma.nicheHub.delete({
    where: { id: postId },
  });

  return;
};

const deleteNicheHubPostByAdmin = async (postId: string) => {
  const post = await prisma.nicheHub.findUnique({
    where: { id: postId },
  })

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, "Post not found");
  }

  await Promise.all(post.fileUrl.map((url) => deleteFromS3ByUrl(url)));

  await prisma.nicheHub.delete({
    where: { id: postId },
  });

  return;

}

const voteInPoll = async (pollId: string, optionId: string, userId: string) => {
  const pollOption = await prisma.pollOption.findFirst({
    where: {
      id: optionId,
      pollId,
    },
  });

  if (!pollOption) {
    throw new ApiError(httpStatus.NOT_FOUND, "Poll option not found");
  }

  const existingVote = await prisma.pollVote.findFirst({
    where: { pollId, userId },
  });

  if (existingVote) {
    if (existingVote.optionId === optionId) {
      await prisma.pollVote.delete({ where: { id: existingVote.id } });
      await prisma.pollOption.update({
        where: { id: optionId },
        data: { voteCount: { decrement: 1 } },
      });

      return { message: "Vote removed successfully", status: "unvoted" };
    } else {
      await prisma.pollVote.delete({ where: { id: existingVote.id } });

      await prisma.pollOption.update({
        where: { id: existingVote.optionId },
        data: { voteCount: { decrement: 1 } },
      });

      await prisma.pollVote.create({
        data: { pollId, optionId, userId },
      });

      await prisma.pollOption.update({
        where: { id: optionId },
        data: { voteCount: { increment: 1 } },
      });

      return { message: "Vote switched successfully", status: "switched" };
    }
  }

  await prisma.pollVote.create({
    data: { pollId, optionId, userId },
  });

  await prisma.pollOption.update({
    where: { id: optionId },
    data: { voteCount: { increment: 1 } },
  });

  return { message: "Vote added successfully", status: "voted" };
};

const reportPost = async (postId: string, userId: string, reason: string, reasonType: string) => {

  const post = await prisma.nicheHub.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, "Post not found");
  }

  const existingReport = await prisma.reportNicheHub.findUnique({
    where: {
      nicheHubId_userId: {
        nicheHubId: postId,
        userId,
      },
    },
  });

  if (existingReport) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You have already reported this post");
  }

  const res = await prisma.reportNicheHub.create({
    data: {
      nicheHubId: postId,
      userId,
      reason,
      reasonType: reasonType as any,
    },
  });

  return res;
}

 

export const nicheHubServices = {
  createNicheHubPost,
  getAllNicheHubPosts,
  getAllNicheHubDataForAdmin,
  updateNicheHubPost,
  deleteNicheHubPost,
  getSingleNicheHubPost,
  voteInPoll,
  reportPost,
  blockAUser,
  deleteNicheHubPostByAdmin, 
};
