import cloudinary from "./cloudinary";
import { Express } from "express";

export const uploadImages = async (imageFiles: Express.Multer.File[]) => {
  const uploadPromises = imageFiles.map(async (image) => {
    const b64 = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${b64}`;
    const res = await cloudinary.uploader.upload(dataURI);
    return res.secure_url;
  });
  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
};
