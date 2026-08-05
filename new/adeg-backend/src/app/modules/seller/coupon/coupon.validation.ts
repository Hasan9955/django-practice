import { z } from "zod";

const DiscountTypeEnum = z.enum(["PERCENTAGE", "FIXED"]);

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const couponSchema = z
  .object({
    code: z.string().min(1, "code is required"),
    discountType: DiscountTypeEnum,
    storeId: z
      .string()
      .regex(objectIdRegex, "storeId must be a valid 24-char MongoDB ObjectId"),
    discountValue: z.number().nonnegative("discountValue must be >= 0"),
    validFrom: z.preprocess((arg) => {
      if (arg instanceof Date) return arg;
      if (typeof arg === "string" || typeof arg === "number") return new Date(arg);
      return arg;
    }, z.date({ required_error: "validFrom is required", invalid_type_error: "validFrom must be a valid date" })),
    validTill: z.preprocess((arg) => {
      if (arg instanceof Date) return arg;
      if (typeof arg === "string" || typeof arg === "number") return new Date(arg);
      return arg;
    }, z.date({ required_error: "validTill is required", invalid_type_error: "validTill must be a valid date" })),
  })
  .superRefine((data, ctx) => {
    if (data.validFrom && data.validTill && data.validTill < data.validFrom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validTill must be the same or after validFrom",
        path: ["validTill"],
      });
    }
    if (data.discountType === "PERCENTAGE") {
      if (data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "discountValue must be between 0 and 100 for percentage discounts",
          path: ["discountValue"],
        });
      }
    }

  });



export const couponValidation = {
  couponSchema,
};