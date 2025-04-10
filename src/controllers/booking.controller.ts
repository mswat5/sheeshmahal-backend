import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const bookings = await prisma.booking.findMany({
      where: { userId: userId },
      include: {
        hotel: true,
      },
      orderBy: {
        checkIn: "desc",
      },
    });
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching user bookings", err);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
};
