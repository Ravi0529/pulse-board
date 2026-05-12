import express from "express";
import type { Router } from "express";

import PollController from "./poll.controller";
import { restrictToAuthenticatedUser } from "../middleware/auth.middleware";

const pollController = new PollController();

export const pollRouter: Router = express.Router();

pollRouter.post(
  "/create-poll",
  restrictToAuthenticatedUser(),
  pollController.handleCreatePoll.bind(pollController),
);

pollRouter.put(
  "/:pollId",
  restrictToAuthenticatedUser(),
  pollController.handleUpdatePoll.bind(pollController),
);

pollRouter.delete(
  "/:pollId/questions/:questionId/options/:optionId",
  restrictToAuthenticatedUser(),
  pollController.handleDeleteQuestionOption.bind(pollController),
);

pollRouter.delete(
  "/:pollId/questions/:questionId",
  restrictToAuthenticatedUser(),
  pollController.handleDeletePollQuestion.bind(pollController),
);

pollRouter.delete(
  "/:pollId",
  restrictToAuthenticatedUser(),
  pollController.handleDeletePoll.bind(pollController),
);

pollRouter.get(
  "/my-polls",
  restrictToAuthenticatedUser(),
  pollController.handleGetMyPolls.bind(pollController),
);
pollRouter.get(
  "/:pollId",
  pollController.handleGetPollById.bind(pollController),
);
