import type { Request, Response } from "express";
import { eq } from "drizzle-orm";

import { createPollSchema, updatePollSchema } from "./poll.schema";
import { db } from "../../db";
import { polls, questions as questionsTable, options } from "../../db/schema";

type PollParams = {
  pollId: string;
};

type PollQuestionParams = {
  pollId: string;
  questionId: string;
};

type PollQuestionOptionParams = {
  pollId: string;
  questionId: string;
  optionId: string;
};

class PollController {
  public async handleCreatePoll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const parsed = createPollSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
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

      return res
        .status(201)
        .json({ message: "Poll created successfully", poll: fullPoll });
    } catch (error) {
      return res.status(500).json({ error: "Failed to create poll" });
    }
  }

  public async handleGetMyPolls(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
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

      return res.status(200).json({ polls: userPolls });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch polls" });
    }
  }

  public async handleGetPollById(req: Request<PollParams>, res: Response) {
    try {
      const { pollId } = req.params;

      if (typeof pollId !== "string") {
        return res.status(400).json({ error: "Invalid poll id" });
      }

      const poll = await db.query.polls.findFirst({
        where: eq(polls.id, pollId),

        with: {
          creator: true,
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

      if (isPublished) {
        return res.status(200).json({
          poll: {
            id: poll.id,
            title: poll.title,
            description: poll.description,
            creatorId: poll.creatorId,
            creator: poll.creator
              ? {
                  id: poll.creator.id,
                  username: poll.creator.username,
                  email: poll.creator.email,
                }
              : null,
            responseMode: poll.responseMode,
            expiresAt: poll.expiresAt,
            isPublished,
            createdAt: poll.createdAt,
            updatedAt: poll.updatedAt,
            canVote: false,
            analyticsAvailable: true,
          },
        });
      }

      return res.status(200).json({
        poll: {
          ...poll,
          creator: poll.creator
            ? {
                id: poll.creator.id,
                username: poll.creator.username,
                email: poll.creator.email,
              }
            : null,
          isPublished,
          canVote: true,
          analyticsAvailable: req.user?.id === poll.creatorId,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch poll" });
    }
  }

  public async handleUpdatePoll(req: Request<PollParams>, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { pollId } = req.params;

      if (typeof pollId !== "string") {
        return res.status(400).json({ error: "Invalid poll id" });
      }

      const parsed = updatePollSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      const existingPoll = await db.query.polls.findFirst({
        where: eq(polls.id, pollId),
      });

      if (!existingPoll) {
        return res.status(404).json({ error: "Poll not found" });
      }

      if (existingPoll.creatorId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await db.transaction(async (tx) => {
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

      return res
        .status(200)
        .json({ message: "Poll updated successfully", poll: fullPoll });
    } catch (error) {
      return res.status(500).json({ error: "Failed to update poll" });
    }
  }

  public async handleDeletePoll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { pollId } = req.params;

      if (typeof pollId !== "string") {
        return res.status(400).json({ error: "Invalid poll id" });
      }

      const existingPoll = await db.query.polls.findFirst({
        where: eq(polls.id, pollId),
      });

      if (!existingPoll) {
        return res.status(404).json({ error: "Poll not found" });
      }

      if (existingPoll.creatorId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await db.delete(polls).where(eq(polls.id, pollId));

      return res.status(200).json({
        message: "Poll deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete poll" });
    }
  }

  public async handleDeletePollQuestion(
    req: Request<PollQuestionParams>,
    res: Response,
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { pollId, questionId } = req.params;

      if (typeof pollId !== "string" || typeof questionId !== "string") {
        return res.status(400).json({ error: "Invalid poll or question id" });
      }

      const existingPoll = await db.query.polls.findFirst({
        where: eq(polls.id, pollId),
      });

      if (!existingPoll) {
        return res.status(404).json({ error: "Poll not found" });
      }

      if (existingPoll.creatorId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const pollQuestions = await db.query.questions.findMany({
        where: eq(questionsTable.pollId, pollId),
        orderBy: (questions, { asc }) => [asc(questions.order)],
      });

      if (pollQuestions.length === 0) {
        return res
          .status(404)
          .json({ error: "No questions found for this poll" });
      }

      const questionToDelete = pollQuestions.find(
        (question) => question.id === questionId,
      );

      if (!questionToDelete) {
        return res.status(404).json({ error: "Question not found" });
      }

      if (pollQuestions.length === 1) {
        return res
          .status(400)
          .json({ error: "A poll must have at least one question" });
      }

      await db.transaction(async (tx) => {
        await tx
          .delete(questionsTable)
          .where(eq(questionsTable.id, questionId));

        const remainingQuestions = pollQuestions.filter(
          (question) => question.id !== questionId,
        );

        for (const [questionIndex, question] of remainingQuestions.entries()) {
          await tx
            .update(questionsTable)
            .set({
              order: questionIndex + 1,
            })
            .where(eq(questionsTable.id, question.id));
        }
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

      return res
        .status(200)
        .json({ message: "Question deleted successfully", poll: fullPoll });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete question" });
    }
  }

  public async handleDeleteQuestionOption(
    req: Request<PollQuestionOptionParams>,
    res: Response,
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { pollId, questionId, optionId } = req.params;

      if (
        typeof pollId !== "string" ||
        typeof questionId !== "string" ||
        typeof optionId !== "string"
      ) {
        return res
          .status(400)
          .json({ error: "Invalid poll, question, or option id" });
      }

      const existingPoll = await db.query.polls.findFirst({
        where: eq(polls.id, pollId),
      });

      if (!existingPoll) {
        return res.status(404).json({ error: "Poll not found" });
      }

      if (existingPoll.creatorId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const question = await db.query.questions.findFirst({
        where: eq(questionsTable.id, questionId),
        with: {
          options: {
            orderBy: (options, { asc }) => [asc(options.order)],
          },
        },
      });

      if (!question || question.pollId !== pollId) {
        return res.status(404).json({ error: "Question not found" });
      }

      const optionToDelete = question.options.find(
        (option) => option.id === optionId,
      );

      if (!optionToDelete) {
        return res.status(404).json({ error: "Option not found" });
      }

      if (question.options.length <= 2) {
        return res
          .status(400)
          .json({ error: "A question must have at least two options" });
      }

      await db.transaction(async (tx) => {
        await tx.delete(options).where(eq(options.id, optionId));

        const remainingOptions = question.options.filter(
          (option) => option.id !== optionId,
        );

        for (const [optionIndex, option] of remainingOptions.entries()) {
          await tx
            .update(options)
            .set({
              order: optionIndex + 1,
            })
            .where(eq(options.id, option.id));
        }
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

      return res
        .status(200)
        .json({ message: "Option deleted successfully", poll: fullPoll });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete option" });
    }
  }
}

export default PollController;
