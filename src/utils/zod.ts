import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(2),
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createHotelSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(4, "Description must be at least 4 characters"),
  price: z
    .string()
    .regex(/^\d+$/, "Price must be a number")
    .transform(Number)
    .refine((val) => val > 0, "Price must be greater than 0"),
  location: z.string().min(3, "Location is required"),
  images: z.array(z.string().url("Invalid image URL")).optional(),
});

export const updateHotelSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.string().regex(/^\d+$/).transform(Number).optional(),
  location: z.string().min(3).optional(),
  images: z.array(z.string().url()).optional(),
});
