import type { Request, Response } from "express";
import { eq } from "drizzle-orm";

import { createPollSchema, updatePollSchema } from "./poll.schema";
import { db } from "../../db";
import { polls, questions as questionsTable, options } from "../../db/schema";

class PollController {
  public async handleCreatePoll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const parsed = createPollSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: parsed.error.flatten(),
        });
      }

      const userId = req.user.id;

      const { title, description, responseMode, expiresAt, questions } =
        parsed.data;

      const createdPoll = await db.transaction(async (tx) => {
        const [poll] = await tx
          .insert(polls)
          .values({
            title,
            description,
            responseMode,
            expiresAt: new Date(expiresAt),
            creatorId: userId,
          })
          .returning();

        if (!poll) {
          throw new Error("Failed to create poll");
        }

        for (const [questionIndex, currentQuestion] of questions.entries()) {
          const [createdQuestion] = await tx
            .insert(questionsTable)
            .values({
              pollId: poll.id,
              question: currentQuestion.question,
              required: currentQuestion.required,
              order: questionIndex + 1,
            })
            .returning();

          if (!createdQuestion) {
            throw new Error("Failed to create question");
          }

          const optionValues = currentQuestion.options.map(
            (optionText, optionIndex) => ({
              questionId: createdQuestion.id,
              text: optionText,
              order: optionIndex + 1,
            }),
          );

          await tx.insert(options).values(optionValues);
        }

        return poll;
      });

      const fullPoll = await db.query.polls.findFirst({
        where: eq(polls.id, createdPoll.id),

        with: {
          questions: {
            orderBy: (questions, { asc }) => [asc(questions.order)],

            with: {
              options: {
                orderBy: (options, { asc }) => [asc(options.order)],
              },
            },
          },
        },
      });

      return res.status(201).json({
        message: "Poll created successfully",
        poll: fullPoll,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Failed to create poll",
      });
    }
  }

  public async handleGetMyPolls(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const userPolls = await db.query.polls.findMany({
        where: eq(polls.creatorId, req.user.id),

        orderBy: (polls, { desc }) => [desc(polls.createdAt)],

        with: {
          questions: {
            orderBy: (questions, { asc }) => [asc(questions.order)],

            with: {
              options: {
                orderBy: (options, { asc }) => [asc(options.order)],
              },
            },
          },
        },
      });

      return res.status(200).json({
        polls: userPolls,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Failed to fetch polls",
      });
    }
  }

  public async handleGetPollById(req: Request, res: Response) {
    try {
      const { pollId } = req.params;

      if (typeof pollId !== "string") {
        return res.status(400).json({
          error: "Invalid poll id",
        });
      }

      const poll = await db.query.polls.findFirst({
        where: eq(polls.id, pollId),

        with: {
          questions: {
            orderBy: (questions, { asc }) => [asc(questions.order)],

            with: {
              options: {
                orderBy: (options, { asc }) => [asc(options.order)],
              },
            },
          },
        },
      });

      if (!poll) {
        return res.status(404).json({
          error: "Poll not found",
        });
      }

      return res.status(200).json({
        poll,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Failed to fetch poll",
      });
    }
  }

  public async handleUpdatePoll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const { pollId } = req.params;

      if (typeof pollId !== "string") {
        return res.status(400).json({
          error: "Invalid poll id",
        });
      }

      const parsed = updatePollSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: parsed.error.flatten(),
        });
      }

      const existingPoll = await db.query.polls.findFirst({
        where: eq(polls.id, pollId),
      });

      if (!existingPoll) {
        return res.status(404).json({
          error: "Poll not found",
        });
      }

      if (existingPoll.creatorId !== req.user.id) {
        return res.status(403).json({
          error: "Forbidden",
        });
      }

      const updatedPoll = await db.transaction(async (tx) => {
        const [poll] = await tx
          .update(polls)
          .set({
            title: parsed.data.title,
            description: parsed.data.description,
            responseMode: parsed.data.responseMode,
            expiresAt: parsed.data.expiresAt
              ? new Date(parsed.data.expiresAt)
              : undefined,
          })
          .where(eq(polls.id, pollId))
          .returning();

        if (parsed.data.questions) {
          await tx
            .delete(questionsTable)
            .where(eq(questionsTable.pollId, pollId));

          for (const [
            questionIndex,
            currentQuestion,
          ] of parsed.data.questions.entries()) {
            const [createdQuestion] = await tx
              .insert(questionsTable)
              .values({
                pollId: pollId,
                question: currentQuestion.question,
                required: currentQuestion.required,
                order: questionIndex + 1,
              })
              .returning();

            const optionValues = currentQuestion.options.map(
              (optionText, optionIndex) => ({
                questionId: createdQuestion!.id,
                text: optionText,
                order: optionIndex + 1,
              }),
            );

            await tx.insert(options).values(optionValues);
          }
        }

        return poll;
      });

      const fullPoll = await db.query.polls.findFirst({
        where: eq(polls.id, pollId),

        with: {
          questions: {
            orderBy: (questions, { asc }) => [asc(questions.order)],

            with: {
              options: {
                orderBy: (options, { asc }) => [asc(options.order)],
              },
            },
          },
        },
      });

      return res.status(200).json({
        message: "Poll updated successfully",
        poll: fullPoll,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Failed to update poll",
      });
    }
  }

  public async handleDeletePoll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const { pollId } = req.params;

      if (typeof pollId !== "string") {
        return res.status(400).json({
          error: "Invalid poll id",
        });
      }

      const existingPoll = await db.query.polls.findFirst({
        where: eq(polls.id, pollId),
      });

      if (!existingPoll) {
        return res.status(404).json({
          error: "Poll not found",
        });
      }

      if (existingPoll.creatorId !== req.user.id) {
        return res.status(403).json({
          error: "Forbidden",
        });
      }

      await db.delete(polls).where(eq(polls.id, pollId));

      return res.status(200).json({
        message: "Poll deleted successfully",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Failed to delete poll",
      });
    }
  }
}

export default PollController;
