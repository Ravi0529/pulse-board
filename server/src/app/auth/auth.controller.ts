import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { signupSchema, signinSchema } from "./auth.schema";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { createUserToken } from "../utils/token";

class AuthenticationController {
  public async handleSignup(req: Request, res: Response) {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error });
      }

      const { username, email, password } = parsed.data;

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingUser.length > 0) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      await db.insert(users).values({
        username,
        email,
        password: hashedPassword,
      });

      return res.status(201).json({ message: "User Signed Up Successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Signup failed" });
    }
  }

  public async handleSignin(req: Request, res: Response) {
    try {
      const parsed = signinSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error });
      }

      const { email, password } = parsed.data;

      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (userResult.length === 0) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const user = userResult[0];

      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = createUserToken({
        id: user.id,
      });

      return res
        .status(200)
        .json({ message: "Login Successful", token: token });
    } catch (error) {
      return res.status(500).json({ error: "Signin failed" });
    }
  }

  public async handleLogout(_: Request, res: Response) {
    return res.status(200).json({ message: "Logged out successfully" });
  }

  public async handleGetCurrentUser(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.json({ user: req.user });
  }
}

export default AuthenticationController;
