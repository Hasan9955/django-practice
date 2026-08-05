import { IntervalType, SubscriptionType } from "@prisma/client";
import { z } from "zod";

const featureSchema = z.array(
  z.object({
    key: z.string().min(1, "Feature label is required"),
    value: z.union([z.string(), z.number()]),
  })
);



const subscriptionSchema = z.object({
    
    title: z.string({ required_error: "Title is required" }).min(1, { message: "Title cannot be empty" }),
    type: z.nativeEnum(SubscriptionType, { required_error: "Type is required" }),
    interval: z.nativeEnum(IntervalType, { required_error: "Interval is required" }),
    interval_count: z.number({ required_error: "Interval count is required" }),
    price: z.number({ required_error: "Price is required" }),
    features: featureSchema.optional(),
    heading: z.string().optional()
});

export const subscriptionValidation = {
  subscriptionSchema,
};
