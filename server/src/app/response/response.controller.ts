import type { Request, Response } from "express";
import { and, eq } from "drizzle-orm";

import { db } from "../../db";
import { answers, polls, responses } from "../../db/schema";
import { submitPollResponseSchema } from "./response.schema";

type SubmitResponseParams = {
  pollId: string;
};

class ResponseController {
  public async handleSubmitResponse(
    req: Request<SubmitResponseParams>,
    res: Response,
  ) {
    try {
      const { pollId } = req.params;

      if (typeof pollId !== "string" || pollId.length === 0) {
        return res.status(400).json({ error: "Invalid poll id" });
      }

      const parsed = submitPollResponseSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      const poll = await db.query.polls.findFirst({
        where: eq(polls.id, pollId),

        with: {
          questions: {
            with: {
              options: true,
            },
          },
        },
      });

      if (!poll) {
        return res.status(404).json({ error: "Poll not found" });
      }

      const isExpired = new Date() > poll.expiresAt;

      if (isExpired) {
        if (!poll.isPublished) {
          await db
            .update(polls)
            .set({
              isPublished: true,
            })
            .where(eq(polls.id, poll.id));
        }

        return res.status(400).json({ error: "Poll has expired" });
      }

      if (poll.responseMode === "AUTHENTICATED" && !req.user) {
        return res.status(401).json({ error: "Login required" });
      }

      if (poll.responseMode === "ANONYMOUS" && req.user) {
        return res
          .status(403)
          .json({ error: "Authenticated users cannot answer this poll" });
      }

      if (
        poll.responseMode === "ANONYMOUS" &&
        !parsed.data.anonymousIdentifier
      ) {
        return res.status(400).json({ error: "Anonymous identifier required" });
      }

      const submittedAnswers = parsed.data.answers;

      const requiredQuestions = poll.questions.filter(
        (question) => question.required,
      );

      for (const requiredQuestion of requiredQuestions) {
        const answered = submittedAnswers.some(
          (answer) => answer.questionId === requiredQuestion.id,
        );

        if (!answered) {
          return res.status(400).json({
            error: `Required question missing: ${requiredQuestion.question}`,
          });
        }
      }

      for (const answer of submittedAnswers) {
        const question = poll.questions.find((q) => q.id === answer.questionId);

        if (!question) {
          return res.status(400).json({ error: "Invalid question" });
        }

        const optionBelongs = question.options.some(
          (option) => option.id === answer.optionId,
        );

        if (!optionBelongs) {
          return res
            .status(400)
            .json({ error: "Option does not belong to question" });
        }
      }

      if (poll.responseMode === "AUTHENTICATED" && req.user) {
        const existingResponse = await db
          .select()
          .from(responses)
          .where(
            and(
              eq(responses.pollId, pollId),
              eq(responses.userId, req.user.id),
            ),
          )
          .limit(1);

        if (existingResponse.length > 0) {
          return res
            .status(400)
            .json({ error: "You already submitted this poll" });
        }
      }

      if (poll.responseMode === "ANONYMOUS") {
        const existingAnonymousResponse = await db
          .select()
          .from(responses)
          .where(
            and(
              eq(responses.pollId, pollId),

              eq(
                responses.anonymousIdentifier,
                parsed.data.anonymousIdentifier!,
              ),
            ),
          )
          .limit(1);

        if (existingAnonymousResponse.length > 0) {
          return res
            .status(400)
            .json({ error: "You already submitted this poll" });
        }
      }

      const createdResponse = await db.transaction(async (tx) => {
        const [response] = await tx
          .insert(responses)
          .values({
            pollId,

            userId: poll.responseMode === "AUTHENTICATED" ? req.user?.id : null,

            anonymousIdentifier:
              poll.responseMode === "ANONYMOUS"
                ? parsed.data.anonymousIdentifier!
                : null,
          })
          .returning();

        if (!response) {
          throw new Error("Failed to create response");
        }

        const answerValues = submittedAnswers.map((answer) => ({
          responseId: response.id,
          questionId: answer.questionId,
          optionId: answer.optionId,
        }));

        await tx.insert(answers).values(answerValues);

        return response;
      });

      return res.status(201).json({
        message: "Response submitted successfully",
        response: createdResponse,
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to submit response" });
    }
  }
}

export default ResponseController;
