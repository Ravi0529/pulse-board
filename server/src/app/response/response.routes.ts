import express from "express";
import type { Router } from "express";

import ResponseController from "./response.controller";

const responseController = new ResponseController();

export const responseRouter: Router = express.Router();

responseRouter.post(
  "/:pollId/respond",
  responseController.handleSubmitResponse.bind(responseController),
);
