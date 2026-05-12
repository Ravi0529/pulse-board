import type { Request, Response } from "express";
import { eq } from "drizzle-orm";

import { db } from "../../db";
import { polls } from "../../db/schema";
import {
  getOptionVoteCount,
  getPollResponseCount,
} from "../redis/analytics.redis";

type AnalyticsParams = {
  pollId: string;
};

class AnalyticsController {
  public async handleGetPollAnalytics(
    req: Request<AnalyticsParams>,
    res: Response,
  ) {
    try {
      const { pollId } = req.params;

      if (!pollId) {
        return res.status(400).json({ error: "Invalid poll id" });
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
      let isPublished = poll.isPublished;

      if (isExpired && !poll.isPublished) {
        await db
          .update(polls)
          .set({
            isPublished: true,
          })
          .where(eq(polls.id, pollId));

        isPublished = true;
      }

      const isCreator = req.user?.id === poll.creatorId;

      if (!isPublished && !isCreator) {
        return res.status(403).json({
          error: "Analytics are available only to the poll creator while live",
        });
      }

      const totalResponses = await getPollResponseCount(pollId);

      const analyticsQuestions = await Promise.all(
        poll.questions.map(async (question) => {
          const analyticsOptions = await Promise.all(
            question.options.map(async (option) => {
              const votes = await getOptionVoteCount(pollId, option.id);

              const percentage =
                totalResponses === 0
                  ? 0
                  : Number(((votes / totalResponses) * 100).toFixed(2));

              return {
                optionId: option.id,
                text: option.text,
                votes,
                percentage,
              };
            }),
          );

          return {
            questionId: question.id,
            question: question.question,
            required: question.required,
            options: analyticsOptions,
          };
        }),
      );

      return res.status(200).json({
        pollId: poll.id,
        title: poll.title,
        totalResponses,
        isPublished,
        expiresAt: poll.expiresAt,
        questions: analyticsQuestions,
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }
  }
}

export default AnalyticsController;
