import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";


// const createBanner = async (uploadedUrl: any, payload: any) => {
//   if (!uploadedUrl) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "BannerImage file is required");
//   }

//   const result = await prisma.banner.create({
//     data: {
//       bannerUrl: uploadedUrl,
//       ...payload,
//     },
//   });
//   return result;
// };

const getAllBanner = async () => {
  const result = await prisma.banner.findMany();
  return result;
};

const updateBanner = async (id: string, payload: any, uploadedUrl: any) => {
  // if (!uploadedUrl) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Banner file is required");
  // }

  if(uploadedUrl){
    payload.bannerUrl = uploadedUrl
  }

  const result = await prisma.banner.update({
    where: { id },
    data: {
      ...payload, 
    },
  });
  return result;
};

const delteBanner = async (id: string) => {
  const existingBanner = await prisma.banner.findUnique({
    where: { id },
  });

  if (!existingBanner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Banner not found");
  }
  const result = await prisma.banner.delete({
    where: { id },
  });
  return result;
}

export const bannerService = {
  getAllBanner,
  updateBanner,
  delteBanner
};
