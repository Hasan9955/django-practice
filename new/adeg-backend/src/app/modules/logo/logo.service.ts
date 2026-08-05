// import prisma from "../../../shared/prisma";
// import ApiError from "../../../errors/ApiErrors";
// import httpStatus from "http-status";



// const getAllLogos = async () => {
//   const logos = await prisma.logo.findMany();
//   return logos;
// };

// const updateLogo = async (id: string, uploadedUrl: any) => {
//   if (!uploadedUrl) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Logo file is required");
//   }

//   const logo = await prisma.logo.update({
//     where: { id },
//     data: {
//       logoUrl: uploadedUrl,
//     },
//   });
//   return logo;
// };

// export const logoService = {

//   getAllLogos,
//   updateLogo,
// };
