import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

 

interface FaqInput {
  id?: string;
  question: string;
  answer: string;
}

interface FooterInput {
  companyInfo?: string;
  moneyBackGuarantee?: string;
  learnToSell?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedInUrl?: string;
  youtubeUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
}

interface CreateOrUpdatePayload {
  cmsSettingId: string;
  faqs?: FaqInput[];
  privacyPolicy?: string;
  footer?: FooterInput;
}

export const createOrUpdateCmsContent = async (payload: CreateOrUpdatePayload) => {
  const { cmsSettingId, faqs = [], privacyPolicy, footer } = payload;

  const cmsSetting = await prisma.cmsSetting.findUnique({
    where: { id: cmsSettingId },
    include: { footer: true, privacyPolicy: true },
  });

  if (!cmsSetting) throw new ApiError(404, "CMS Setting not found");

  const operations: any[] = [];

  
  for (const faq of faqs) {
    if (faq.id) {
      operations.push(
        prisma.faq.update({
          where: { id: faq.id },
          data: { question: faq.question, answer: faq.answer },
        })
      );
    } else {
      operations.push(
        prisma.faq.create({
          data: { cmsSettingId, question: faq.question, answer: faq.answer },
        })
      );
    }
  }

  
  if (privacyPolicy) {
    if (cmsSetting.privacyPolicy) {
      operations.push(
        prisma.privacyPolicy.update({
          where: { cmsSettingId },
          data: { content: privacyPolicy },
        })
      );
    } else {
      operations.push(
        prisma.privacyPolicy.create({
          data: { cmsSettingId, content: privacyPolicy },
        })
      );
    }
  }

  
  if (footer) {
    if (cmsSetting.footer) {
      operations.push(
        prisma.footer.update({
          where: { cmsSettingId },
          data: { ...footer },
        })
      );
    } else {
      operations.push(
        prisma.footer.create({
          data: { ...footer, cmsSettingId },
        })
      );
    }
  }

  const results = await prisma.$transaction(operations);

  return {
    message: "CMS content successfully updated",
    results,
  };
};



const deleteFaq = async (id: string) => {
  const result = await prisma.faq.delete({
    where: { id },
  });
  return result;
}


const getCmsContent = async () => {
  const cmsContent = await prisma.cmsSetting.findFirst({
    include: {
      faq: true,
      privacyPolicy: true,
      footer: true,
    },
  });

  return cmsContent;
};




export const faqService = { createOrUpdateCmsContent, deleteFaq, getCmsContent };


