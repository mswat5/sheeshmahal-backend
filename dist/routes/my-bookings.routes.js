"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = __importDefault(require("../middlewares/authenticateToken"));
const booking_controller_1 = require("../controllers/booking.controller");
const hotel_controller_1 = require("../controllers/hotel.controller");
const router = (0, express_1.Router)();
router.post("/razorpay-order", authenticateToken_1.default, hotel_controller_1.createRazorpayOrder);
// router.post("/webhook", handleWebhook);
router.get("/", authenticateToken_1.default, booking_controller_1.getMyBookings);
// router.get("/:id", authenticateToken, getBookingById);
exports.default = router;
