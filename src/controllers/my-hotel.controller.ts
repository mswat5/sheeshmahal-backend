import { Request, Response } from "express";
import { createHotelSchema, updateHotelSchema } from "../utils/zod";
import { formatZodError } from "../utils/formatZodError";
import { uploadImages } from "../utils/uploadImages";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createHotel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const imageFiles = req.files as Express.Multer.File[];
    const imageUrls = await uploadImages(imageFiles);
    //   const image = imageUrls[0];
    const validation = createHotelSchema.safeParse({
      ...req.body,
      images: imageUrls,
    });
    if (!validation.success) {
      res.status(400).json({ errors: formatZodError(validation.error) });
      return;
    }
    const { title, description, location, price, images } = validation.data;

    const hotel = await prisma.hotel.create({
      data: {
        title,
        description,
        price,
        location,
        images,
        userId,
      },
    });

    res.status(201).json(hotel);
  } catch (error) {
    console.error("Create Hotel Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMyHotel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const hotels = await prisma.hotel.findMany({
      where: { userId: userId },
    });
    res.status(200).json(hotels);
  } catch (error) {
    console.error("get Hotel Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMyHotelById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.body);
    const userId = (req as any).user.id;
    const hotel = await prisma.hotel.findFirst({
      where: { id, userId },
    });
    if (!hotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }

    res.status(200).json(hotel);
  } catch (error) {
    console.error("get Hotel by id Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateHotel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const hotelId = parseInt(req.params.hotelId, 10);
    const existingHotel = await prisma.hotel.findFirst({
      where: {
        id: hotelId,
        userId,
      },
    });

    if (!existingHotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }
    let imageUrls: string[] = existingHotel.images;
    const files = req.files as Express.Multer.File[];

    if (files && files.length > 0) {
      const newImageUrls = await uploadImages(files);
      imageUrls = [...newImageUrls, ...imageUrls];
    }
    const validation = updateHotelSchema.safeParse({
      ...req.body,
      images: imageUrls,
    });
    if (!validation.success) {
      res.status(400).json({ errors: formatZodError(validation.error) });
      return;
    }
    const updatedHotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        ...validation.data,
        images: imageUrls,
      },
    });
    res.status(200).json(updatedHotel);
  } catch (error) {
    console.error("Update Hotel Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
