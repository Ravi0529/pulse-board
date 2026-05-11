import express from "express";
import type { Router } from "express";
import AuthenticationController from "./auth.controller";
import { restrictToAuthenticatedUser } from "../middleware/auth.middleware";

const authenticationController = new AuthenticationController();

export const authRouter: Router = express.Router();

authRouter.post(
  "/signup",
  authenticationController.handleSignup.bind(authenticationController),
);
authRouter.post(
  "/signin",
  authenticationController.handleSignin.bind(authenticationController),
);
authRouter.post(
  "/logout",
  restrictToAuthenticatedUser(),
  authenticationController.handleLogout.bind(authenticationController),
);

authRouter.get(
  "/me",
  restrictToAuthenticatedUser(),
  authenticationController.handleGetCurrentUser.bind(authenticationController),
);
