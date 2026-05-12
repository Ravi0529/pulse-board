import express from "express";
import type { Router } from "express";

import AnalyticsController from "./analytics.controller";

const analyticsController = new AnalyticsController();

export const analyticsRouter: Router = express.Router();

analyticsRouter.get(
  "/:pollId",
  analyticsController.handleGetPollAnalytics.bind(analyticsController),
);
