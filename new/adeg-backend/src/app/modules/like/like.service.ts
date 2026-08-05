import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";



const toggleLike = async (userId: string, nicheHubId: string) => {

  const existingNicheHub  = await prisma.nicheHub.findUnique({
    where: { id: nicheHubId },
  });

  if (!existingNicheHub) {
    throw new ApiError(httpStatus.NOT_FOUND, "NicheHub not found");
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_nicheHubId: { userId, nicheHubId },
    },
  });

  let result;

  if (existingLike) {
    await prisma.like.delete({
      where: { userId_nicheHubId: { userId, nicheHubId } },
    });

    await prisma.nicheHub.update({
      where: { id: nicheHubId },
      data: { likeCount: { decrement: 1 } },
    });

    result = { isLiked: false };
  } else {

    await prisma.like.create({
      data: { userId, nicheHubId },
    });


    await prisma.nicheHub.update({
      where: { id: nicheHubId },
      data: { likeCount: { increment: 1 } },
    });

    result = { isLiked: true };
  }

  return result;
};


const seeAllLikeUser = async (nicheHubId: string) => {
  const result = await prisma.like.findMany({
    where: {
      nicheHubId,
    },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      }
    },
  });
  return result;
};




export const LikeServices = {
  toggleLike,
  seeAllLikeUser,
};
