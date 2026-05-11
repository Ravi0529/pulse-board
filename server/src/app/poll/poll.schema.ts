import { z } from "zod";

export const createPollSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().max(2000).optional(),
  responseMode: z.enum(["ANONYMOUS", "AUTHENTICATED"]),
  expiresAt: z
    .string()
    .datetime()
    .refine((date) => new Date(date).getTime() > Date.now(), {
      message: "Expiry date must be in the future",
    }),
});

export const updatePollSchema = createPollSchema.partial();
