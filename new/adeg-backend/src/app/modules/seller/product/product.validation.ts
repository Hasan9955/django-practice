import { z } from "zod";
const createProductSchema = z.object({
  email: z.string().email("Invalid email address"),
  reason: z.string({ required_error: "reson is needed" }),
});
export const productValidation = {
 createProductSchema
};
