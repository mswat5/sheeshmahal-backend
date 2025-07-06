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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRazorpayPayment = exports.createRazorpayOrder = exports.getAllHotels = exports.getHotelById = exports.searchHotels = void 0;
const searchQuery_1 = require("../utils/searchQuery");
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const razorpay_1 = require("../utils/razorpay");
const prisma = new client_1.PrismaClient();
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const searchHotels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const filters = (0, searchQuery_1.constructSearchQuery)(req.query);
        const sortOption = req.query.sortOption;
        let orderBy = {};
        switch (sortOption) {
            case "starRating":
                orderBy = { starRating: "desc" };
                break;
            case "pricePerNightAsc":
                orderBy = { pricePerNight: "asc" };
                break;
            case "pricePerNightDesc":
                orderBy = { pricePerNight: "desc" };
                break;
            default:
                orderBy = { createdAt: "desc" }; // fallback
        }
        const pageSize = 5;
        const pageNumber = parseInt(((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString()) || "1");
        const skip = (pageNumber - 1) * pageSize;
        const hotels = yield prisma.hotel.findMany({
            where: filters,
            orderBy,
            skip,
            take: pageSize,
        });
        const total = yield prisma.hotel.count({
            where: filters,
        });
        res.json({
            data: hotels,
            pagination: {
                total,
                page: pageNumber,
                pages: Math.ceil(total / pageSize),
            },
        });
    }
    catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.searchHotels = searchHotels;
const getHotelById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid hotel ID" });
        }
        const hotel = yield prisma.hotel.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        return res.status(200).json(hotel);
    }
    catch (error) {
        console.error("Get Hotel By ID Error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getHotelById = getHotelById;
const getAllHotels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [hotels, total] = yield Promise.all([
            prisma.hotel.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.hotel.count(),
        ]);
        res.status(200).json({
            data: hotels,
            page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        });
    }
    catch (error) {
        console.error("Get All Hotels Error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getAllHotels = getAllHotels;
const createRazorpayOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, adultCount, childCount, checkIn, checkOut, totalCost, hotelId, } = req.body;
        const userId = req.user.id;
        const options = {
            amount: Math.round(totalCost * 100), // ₹ to paise
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };
        const order = yield razorpay_1.razorpay.orders.create(options);
        const booking = yield prisma.booking.create({
            data: {
                firstName,
                lastName,
                email,
                adultCount,
                childCount,
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                userId,
                totalCost,
                hotelId,
                razorpayOrderId: order.id,
                paymentStatus: "pending",
            },
        });
        res.status(201).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            bookingId: booking.id,
        });
    }
    catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ message: "Failed to create Razorpay order" });
    }
});
exports.createRazorpayOrder = createRazorpayOrder;
const verifyRazorpayPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, } = req.body;
        const userId = req.user.id;
        if (!razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !bookingId) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const generatedSignature = crypto_1.default
            .createHmac("sha256", RAZORPAY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");
        if (generatedSignature != razorpay_signature) {
            res.status(400).json({ message: "payment verification failed" });
            return;
        }
        yield prisma.booking.update({
            where: { id: bookingId },
            data: {
                razorpayPaymentId: razorpay_payment_id,
                paymentStatus: "paid",
            },
        });
        res.status(200).json({
            message: "Payment verified and booking successful",
        });
    }
    catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.verifyRazorpayPayment = verifyRazorpayPayment;
