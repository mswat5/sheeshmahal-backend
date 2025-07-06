"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHotel = exports.getMyHotelById = exports.getMyHotel = exports.createHotel = void 0;
const zod_1 = require("../utils/zod");
const formatZodError_1 = require("../utils/formatZodError");
const uploadImages_1 = require("../utils/uploadImages");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createHotel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const imageFiles = req.files;
        const imageUrls = yield (0, uploadImages_1.uploadImages)(imageFiles);
        //   const image = imageUrls[0];
        const validation = zod_1.createHotelSchema.safeParse(Object.assign(Object.assign({}, req.body), { images: imageUrls }));
        if (!validation.success) {
            res.status(400).json({ errors: (0, formatZodError_1.formatZodError)(validation.error) });
            return;
        }
        const { title, description, location, price, images } = validation.data;
        const hotel = yield prisma.hotel.create({
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
    }
    catch (error) {
        console.error("Create Hotel Error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.createHotel = createHotel;
const getMyHotel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const hotels = yield prisma.hotel.findMany({
            where: { userId: userId },
        });
        res.status(200).json(hotels);
    }
    catch (error) {
        console.error("get Hotel Error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getMyHotel = getMyHotel;
const getMyHotelById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.body);
        const userId = req.user.id;
        const hotel = yield prisma.hotel.findFirst({
            where: { id, userId },
        });
        if (!hotel) {
            res.status(404).json({ message: "Hotel not found" });
            return;
        }
        res.status(200).json(hotel);
    }
    catch (error) {
        console.error("get Hotel by id Error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getMyHotelById = getMyHotelById;
const updateHotel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const hotelId = parseInt(req.params.hotelId, 10);
        const existingHotel = yield prisma.hotel.findFirst({
            where: {
                id: hotelId,
                userId,
            },
        });
        if (!existingHotel) {
            res.status(404).json({ message: "Hotel not found" });
            return;
        }
        let imageUrls = existingHotel.images;
        const files = req.files;
        if (files && files.length > 0) {
            const newImageUrls = yield (0, uploadImages_1.uploadImages)(files);
            imageUrls = [...newImageUrls, ...imageUrls];
        }
        const validation = zod_1.updateHotelSchema.safeParse(Object.assign(Object.assign({}, req.body), { images: imageUrls }));
        if (!validation.success) {
            res.status(400).json({ errors: (0, formatZodError_1.formatZodError)(validation.error) });
            return;
        }
        const updatedHotel = yield prisma.hotel.update({
            where: { id: hotelId },
            data: Object.assign(Object.assign({}, validation.data), { images: imageUrls }),
        });
        res.status(200).json(updatedHotel);
    }
    catch (error) {
        console.error("Update Hotel Error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.updateHotel = updateHotel;
