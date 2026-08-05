import { z } from "zod";

const bannerSchema = z.object({
  id: z.string().optional(),
  bannerUrl: z.string().url().optional(),
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

const attributeValueSchema = z.object({
  value: z.string(),
  isApproved: z.boolean().optional().default(true),
});

const attributeSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["DROPDOWN", "BOOLEAN", "DATE", "TEXT"]).transform(val => val.toUpperCase()),
  isRequired: z.boolean().optional().default(false),
  values: z.array(z.union([attributeValueSchema, z.string()]))
    .optional()
    .transform(arr =>
      arr?.map(v => (typeof v === "string" ? { value: v, isApproved: true } : v))
    ),
});

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).transform(val => val.toLowerCase().trim()),
  categoryPhoto: z.string().url().optional(),
  parentId: z.string().nullable().optional(),
  attributes: z.array(attributeSchema).optional(),
});

export const platformUpdateSchema = z.object({
  platformId: z.string().optional(),
  commisionRate: z.number().optional(),
  currency: z.array(z.string()).optional(),
  shippingPolicy: z.array(z.string()).optional(),
  logo: z.string().url().optional(),
  banners: z.array(bannerSchema).optional(),
  categories: z.array(categorySchema).optional(),
  cmsSettingTitle: z.string().optional(),
  aboutUs: z.string().optional(),
  bannerImage: z.string().url().optional(),
  redirectUrl: z.string().optional(),
});