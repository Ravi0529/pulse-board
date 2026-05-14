import express, { urlencoded } from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";

import { authenticationMiddleware } from "./middleware/auth.middleware";
import { authRouter } from "./auth/auth.routes";
import { pollRouter } from "./poll/poll.routes";
import { responseRouter } from "./response/response.routes";
import { analyticsRouter } from "./analytics/analytics.routes";

export function createApplication(): Express {
  const app = express();

  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://pulse-board-3r5r.onrender.com/",
      ],
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(urlencoded({ extended: true, limit: "5mb" }));
  app.use(authenticationMiddleware());

  app.get("/health", (_: Request, res: Response) => {
    res.json({ message: "Welcome to the PulseBoard server!" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/poll", pollRouter);
  app.use("/api/responses", responseRouter);
  app.use("/api/analytics", analyticsRouter);

  return app;
}
