import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

const createFollow = async (followerId: string, storeId: string) => {

    const user = await prisma.user.findUnique({ where: { id: followerId } });
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }


    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
        throw new ApiError(httpStatus.NOT_FOUND, "Store not found");
    }


    const existingFollow = await prisma.follow.findFirst({
        where: { followerId, storeId },
    });

    //Unfollow if already following
    if (existingFollow) {
        await prisma.follow.delete({
            where: { id: existingFollow.id },
        });

        await prisma.store.update({
            where: { id: storeId },
            data: {
                followers: {
                    decrement: 1
                }
            },
        });

        return { message: "Unfollowed successfully", isFollowing: false };
    }

    //Follow the store if not following
    await prisma.follow.create({
        data: { followerId, storeId },
    });

    await prisma.store.update({
        where: { id: storeId },
        data: { followers: { increment: 1 } },
    });

    return { message: "Followed successfully", isFollowing: true };
};

const getMyFollowings = async (userId: string) => {
    const followings = await prisma.follow.findMany({
        where: { followerId: userId },
        include: {
            store: {
                select: {
                    id: true,
                    bannerImage: true,
                    shopName: true,
                    shopLogo: true
                }
            }
        },
    });

    return followings;
};

const getStoreFollower = async (storeId: string) => {
    const followers = await prisma.follow.findMany({
        where: { storeId },
        include: {
            follower: {
                select: {
                    id: true,
                    fullName: true,
                    profileImage: true,
                }
            }
        },
    });
    return followers;
};

export const FollowServices = {
    createFollow,
    getMyFollowings,
    getStoreFollower
};
