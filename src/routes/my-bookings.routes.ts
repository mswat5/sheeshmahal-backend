import { Router } from "express";
import authenticateToken from "../middlewares/authenticateToken";
import { getMyBookings } from "../controllers/booking.controller";
import { createRazorpayOrder } from "../controllers/hotel.controller";

const router = Router();

router.post("/razorpay-order", authenticateToken, createRazorpayOrder);
// router.post("/webhook", handleWebhook);
router.get("/", authenticateToken, getMyBookings);
// router.get("/:id", authenticateToken, getBookingById);
export default router;
