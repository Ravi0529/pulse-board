import type { Request, Response } from "express";
import { eq } from "drizzle-orm";

import { createPollSchema, updatePollSchema } from "./poll.schema";
import { db } from "../../db";
import { polls } from "../../db/schema";

class PollController {
  public async handleCreatePoll(req: Request, res: Response) {
    try {
      const parsed = createPollSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { title, description, responseMode, expiresAt } = parsed.data;

      const [createdPoll] = await db
        .insert(polls)
        .values({
          title,
          description,
          responseMode,
          expiresAt: new Date(expiresAt),
          creatorId: req.user.id,
        })
        .returning();

      return res
        .status(201)
        .json({ message: "Poll created successfully", poll: createdPoll });
    } catch (error) {
      return res.status(500).json({ error: "Failed to create poll" });
    }
  }

  public async handleGetMyPolls(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userPolls = await db
        .select()
        .from(polls)
        .where(eq(polls.creatorId, req.user.id));

      return res.status(200).json({ polls: userPolls });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch polls" });
    }
  }

  public async handleGetPollById(req: Request, res: Response) {
    try {
      const { pollId } = req.params;

      if (typeof pollId !== "string") {
        return res.status(400).json({ error: "Invalid poll id" });
      }

      const poll = await db
        .select()
        .from(polls)
        .where(eq(polls.id, pollId))
        .limit(1);

      if (poll.length === 0) {
        return res.status(404).json({ error: "Poll not found" });
      }

      return res.status(200).json({ poll: poll[0] });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch poll" });
    }
  }

  public async handleUpdatePoll(req: Request, res: Response) {
    try {
      const { pollId } = req.params;

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (typeof pollId !== "string") {
        return res.status(400).json({ error: "Invalid poll id" });
      }

      const parsed = updatePollSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      const existingPoll = await db
        .select()
        .from(polls)
        .where(eq(polls.id, pollId))
        .limit(1);

      if (existingPoll.length === 0) {
        return res.status(404).json({ error: "Poll not found" });
      }

      if (existingPoll[0]?.creatorId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const [updatedPoll] = await db
        .update(polls)
        .set({
          ...parsed.data,
          expiresAt: parsed.data.expiresAt
            ? new Date(parsed.data.expiresAt)
            : undefined,
        })
        .where(eq(polls.id, pollId))
        .returning();

      return res
        .status(200)
        .json({ message: "Poll updated successfully", poll: updatedPoll });
    } catch (error) {
      return res.status(500).json({ error: "Failed to update poll" });
    }
  }

  public async handleDeletePoll(req: Request, res: Response) {
    try {
      const { pollId } = req.params;

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (typeof pollId !== "string") {
        return res.status(400).json({ error: "Invalid poll id" });
      }

      const existingPoll = await db
        .select()
        .from(polls)
        .where(eq(polls.id, pollId))
        .limit(1);

      if (existingPoll.length === 0) {
        return res.status(404).json({ error: "Poll not found" });
      }

      if (existingPoll[0]?.creatorId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await db.delete(polls).where(eq(polls.id, pollId));

      return res.status(200).json({ message: "Poll deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete poll" });
    }
  }
}

export default PollController;
