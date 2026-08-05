import { MessageType, ChatType } from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import { chatService } from "../chat/chat.service";
import { storeAndSendPrivateMessage } from "../../../utlits/socket.helpers";
import { activeUsers } from "../../../socket";
import { getB2BPackagePricing, parseMOQ } from "../../../helpers/b2bPackage";
import ApiError from "../../../errors/ApiErrors";

const createB2bOffer = async (payload: any) => {
  const offerItems: Array<{
    productId: string;
    quantity: unknown;
    unitPrice?: unknown;
  }> = Array.isArray(payload.offerItems) ? payload.offerItems : [];

  if (!offerItems.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "At least one B2B offer item is required",
    );
  }

  let chatType: ChatType = "B2B";

  const convirsation = await chatService.createConversationIntoDB(
    payload.buyerId,
    payload.sellerId,
    chatType,
  );
  const offer = await prisma.$transaction(async (tx) => {
    const offer = await tx.b2BOffer.create({
      data: {
        buyerId: payload.buyerId,
        conversationId: convirsation?.id,
        sellerId: payload.sellerId,
        expectedDeliveryDate: payload.expectedDeliveryDate,
      },
    });

    await tx.b2B_Offer_Items.createMany({
      data: offerItems.map((item) => ({
        ...(() => {
          const quantity = parseMOQ(item.quantity);

          if (!quantity) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              "Offer quantity must be a positive integer",
            );
          }

          const pricing = getB2BPackagePricing(quantity);
          if (!pricing) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              "Invalid B2B MOQ tier for offer item",
            );
          }

          const inputUnitPrice = Number(item.unitPrice);
          const finalUnitPrice =
            Number.isFinite(inputUnitPrice) && inputUnitPrice > 0
              ? inputUnitPrice
              : pricing.pricePerUnit;

          return {
            offerId: offer.id,
            productId: item.productId,
            quantity,
            unitPrice: finalUnitPrice,
          };
        })(),
      })),
    });

    const result: any = await tx.$runCommandRaw({
      aggregate: "offer_items",
      pipeline: [
        { $match: { offerId: { $oid: offer.id } } },
        {
          $group: {
            _id: null,
            total: {
              $sum: { $multiply: ["$unitPrice", "$quantity"] },
            },
          },
        },
      ],
      cursor: {},
    });

    const totalPrice = result?.cursor?.firstBatch?.[0]?.total || 0;

    const updatedOffer = await tx.b2BOffer.update({
      where: { id: offer.id },
      data: { totalPrice },
      include: { offer_Items: true },
    });
    

    return updatedOffer;
  });

  const ws = activeUsers.get(payload.sellerId);

  storeAndSendPrivateMessage(
    ws!,
    payload.sellerId,
    payload.buyerId,
    {
      offerId: offer.id,
      offerData: offer,
    },
    "",
    convirsation?.id!,
    MessageType.OFFER,
    offer.id,
  );
  return offer;
};

const updateB2BOffer = async (payload: any) => {
  const { offerId, offerStatus } = payload;

  const isOfferExist = await prisma.b2BOffer.findUnique({
    where: { id: offerId },
    select: { offerStuts: true },
  });

  if (!isOfferExist) {
    throw new Error("Offer not found");
  }

  const result = await prisma.b2BOffer.update({
    where: { id: offerId },
    data: {
      offerStuts: offerStatus,
    },
  });

  return result;
};

const getMyB2BOrders = async (userId: string) => {
  const result = await prisma.b2BOffer.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
      offerStuts: { in: ["PENDING", "ACCEPTED"] },
    },
    select: {
      id: true,
      totalPrice: true,
      createdAt: true,
      expectedDeliveryDate: true,
      offerStuts: true,

      offer_Items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              productName: true,
              productPhoto: true,
            },
          },
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
    },
  });
  return result;
};

export const b2bService = {
  createB2bOffer,
  getMyB2BOrders,
  updateB2BOffer,
};
