import express, { urlencoded } from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";

export function createApplication(): Express {
  const app = express();

  app.use(
    cors({
      origin: ["http://localhost:5173"],
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(urlencoded({ extended: true, limit: "5mb" }));

  app.get("/health", (_: Request, res: Response) => {
    res.json({ message: "Welcome to the PulseBoard server!" });
  });

  return app;
}
