import { eq } from "drizzle-orm";

import { db } from "../../db";
import { answers, responses } from "../../db/schema";
import { redis } from "./redis";

export async function incrementPollResponseCount(pollId: string) {
  await redis.incr(`poll:${pollId}:responses`);
}

export async function incrementOptionVoteCount(
  pollId: string,
  optionId: string,
) {
  await redis.incr(`poll:${pollId}:option:${optionId}`);
}

export async function getPollResponseCount(pollId: string) {
  const count = await redis.get(`poll:${pollId}:responses`);

  if (count !== null) {
    return Number(count);
  }

  const storedResponses = await db
    .select({ id: responses.id })
    .from(responses)
    .where(eq(responses.pollId, pollId));

  const totalResponses = storedResponses.length;

  await redis.set(`poll:${pollId}:responses`, totalResponses);

  return totalResponses;
}

export async function getOptionVoteCount(pollId: string, optionId: string) {
  const count = await redis.get(`poll:${pollId}:option:${optionId}`);

  if (count !== null) {
    return Number(count);
  }

  const storedAnswers = await db
    .select({ id: answers.id })
    .from(answers)
    .where(eq(answers.optionId, optionId));

  const optionVoteCount = storedAnswers.length;

  await redis.set(`poll:${pollId}:option:${optionId}`, optionVoteCount);

  return optionVoteCount;
}
