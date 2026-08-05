import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../shared/pagination";


const createComment = async (
  userId: string,
  payload: { nicheHubId: string; content: string; parentId?: string }
) => {
  const result = await prisma.comment.create({
    data: {
      userId,
      nicheHubId: payload.nicheHubId,
      content: payload.content,
      parentId: payload.parentId || null,
    },
  });

  await prisma.nicheHub.update({
    where: { id: payload.nicheHubId },
    data: {
      commentCount: {
        increment: 1,
      },
    },
  });

  return result;
};


const getAllCommentsByNicheHubId = async (nicheHubId: string, options: IPaginationOptions) => {
  const { page, limit , skip } = paginationHelper.calculatePagination(options);
  const comments = await prisma.comment.findMany({
    where: {
      nicheHubId: nicheHubId,
      parentId: null,
    },
    orderBy: {
      createdAt: "desc",

    },
    take: limit,
    skip,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
      replies: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
          replies: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  profileImage: true,
                },
              },       
            },
          },
        },
      },
    },
  });

  return {
    meta:{
      page,
      limit,
      total: comments.length,
      totalPage: Math.ceil(comments.length / limit),
    },
    data: comments,
  };
};


export const CommentServices = {
  createComment,
  getAllCommentsByNicheHubId,
};
