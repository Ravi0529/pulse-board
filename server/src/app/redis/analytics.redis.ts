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

  return Number(count ?? 0);
}

export async function getOptionVoteCount(pollId: string, optionId: string) {
  const count = await redis.get(`poll:${pollId}:option:${optionId}`);

  return Number(count ?? 0);
}
