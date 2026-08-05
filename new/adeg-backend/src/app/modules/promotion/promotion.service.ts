import prisma from "../../../shared/prisma";
import { fileUploader } from "../../middlewares/fileUploder";

const createPromotion = async (file: any, payload: any) => {

  let promotionImage : string | null = null;
  if(file){
    const image = await fileUploader.uploadToDigitalOcean(file);
    promotionImage = image.Location
  }
  const { startDate, endDate } = payload;

  
  const start = new Date(startDate);
  const end = new Date(endDate);
 

  if (start >= end) {
    throw new Error("startDate must be earlier than endDate");
  }

  const now = new Date();
  if (end < now) {
    throw new Error("endDate cannot be in the past");
  }

  
  const result = await prisma.promotion.create({
    data: {
      ...payload,
      promotionImage,
      startDate: start,
      endDate: end,
    },
  });

  return result;
};




const getAllPromotion = async () => {
  const currentDate = new Date();

  const result = await prisma.promotion.findMany({
    where: {
      endDate: {
        gte: currentDate, 
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};


const getSinglePromotion = async (id: string) => {
  const result = await prisma.promotion.findUnique({
    where: { id },
  });

  if (!result) {
    throw new Error("Promotion not found");
  }

  return result;
};



const updatePromotion = async (id: string, file: any, payload: any) => {
  const existing = await prisma.promotion.findUnique({ where: { id } });
  if (!existing) throw new Error("Promotion not found");

  let promotionImage = existing.promotionImage;

  if (file) {
    const image = await fileUploader.uploadToDigitalOcean(file);
    promotionImage = image.Location;
  }

  const { startDate, endDate } = payload;
  let start = startDate ? new Date(startDate) : existing.startDate;
  let end = endDate ? new Date(endDate) : existing.endDate;

  if (start >= end) {
    throw new Error("startDate must be earlier than endDate");
  }

  const result = await prisma.promotion.update({
    where: { id },
    data: {
      ...payload,
      promotionImage,
      startDate: start,
      endDate: end,
    },
  });

  return result;
};



const deletePromotion = async (id: string) => {
  const existing = await prisma.promotion.findUnique({ where: { id } });
  if (!existing) throw new Error("Promotion not found");

  const result = await prisma.promotion.delete({
    where: { id },
  });

  return result;
};





export const promotionService = {
  createPromotion,
  getAllPromotion,
  getSinglePromotion,
  updatePromotion,
  deletePromotion
};