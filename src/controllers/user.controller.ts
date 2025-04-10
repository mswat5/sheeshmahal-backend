import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    //hme kya chahiye ? user
    //kese dhund skte? email se..nh userid
    //already authenticated hai to jrurt nhi checkers ki yaha pe
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { fullName } = req.body;
    if (!fullName || typeof fullName != "string") {
      return res
        .status(200)
        .json({ messgae: "fullName is required and must be a string" });
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { fullName },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
    });
  } catch (error) {}
};
