import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../utils/zod";
import { formatZodError } from "../utils/formatZodError";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/email";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

export const registerUser = async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ errors: formatZodError(validation.error) });
      return;
    }

    const { username, fullName, email, password } = validation.data;
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 9);
    const user = await prisma.user.create({
      data: {
        username,
        fullName,
        email,
        password: hashedPassword,
      },
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.userVerification.create({
      data: {
        verifyCode,
        verifyCodeExpiry,
        user: {
          connect: { id: user.id },
        },
      },
    });

    await sendVerificationEmail(email, verifyCode, username);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {});

    res
      .status(200)
      .cookie("authToken", token, {
        httpOnly: true,
      })
      .json({
        message: "user created successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          username: user.username,
        },
      });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred during registration",
    });
    console.error(error);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ errors: formatZodError(validation.error) });
      return;
    }

    const { email, password } = validation.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);

    res
      .status(200)
      .cookie("authToken", token, { httpOnly: true })
      .json({
        message: "sign in successful",
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during sign in" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("authToken", { httpOnly: true });
    res.status(200).json({ message: "Sign out successful" });
  } catch (error) {
    console.error("Error during signout:", error);
    res.status(500).json({ error: "An error occurred during signout" });
  }
};
