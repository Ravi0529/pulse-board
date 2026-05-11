import { z } from "zod";

const questionSchema = z.object({
  question: z.string().min(3, "Question too short"),
  required: z.boolean(),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "Minimum 2 options required")
    .max(10, "Maximum 10 options allowed"),
});

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
  questions: z
    .array(questionSchema)
    .min(1, "At least 1 question required")
    .max(20, "Maximum 20 questions allowed"),
});

export const updatePollSchema = createPollSchema.partial();
