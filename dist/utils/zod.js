"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHotelSchema = exports.createHotelSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(2),
    fullName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.createHotelSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title must be at least 3 characters"),
    description: zod_1.z.string().min(4, "Description must be at least 4 characters"),
    price: zod_1.z
        .string()
        .regex(/^\d+$/, "Price must be a number")
        .transform(Number)
        .refine((val) => val > 0, "Price must be greater than 0"),
    location: zod_1.z.string().min(3, "Location is required"),
    images: zod_1.z.array(zod_1.z.string().url("Invalid image URL")).optional(),
});
exports.updateHotelSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).optional(),
    description: zod_1.z.string().min(10).optional(),
    price: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    location: zod_1.z.string().min(3).optional(),
    images: zod_1.z.array(zod_1.z.string().url()).optional(),
});
