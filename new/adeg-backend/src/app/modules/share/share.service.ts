import { IPaginationOptions } from "../../../interfaces/paginations"
import { paginationHelper } from "../../../shared/pagination"
import prisma from "../../../shared/prisma"


const createShare = async (userId: string, postId: string) => {
    
    const isAlreadyShared = await prisma.share.findFirst({
        where: {
            userId,
            nicheHubId: postId
        }
    })

    if(isAlreadyShared) {
        return { message: "Already shared"}
    }
    
    const share = await prisma.share.create({
        data: {
            userId,
            nicheHubId: postId
        }
    })

    await prisma.nicheHub.update({
        where: {
            id: postId
        },
        data: {
            shareCount: {
                increment: 1
            }
        }
    })

    return share;
}


const getShares = async (
  postId: string,
  options: IPaginationOptions 
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);


  const result = await prisma.share.findMany({
    where: {
      nicheHubId: postId
    },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    profileImage: true,
                }
            }
        }
  });

  

  const total = result.length;

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};




export const shareService = {
    createShare,
    getShares
}


