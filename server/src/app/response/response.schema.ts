import { z } from "zod";

export const submitPollResponseSchema = z.object({
  anonymousIdentifier: z.string().optional(),

  answers: z
    .array(
      z.object({
        questionId: z.uuid(),
        optionId: z.uuid(),
      }),
    )
    .min(1, "At least one answer is required"),
});
