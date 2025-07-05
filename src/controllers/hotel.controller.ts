import { Request, Response } from "express";
import { constructSearchQuery } from "../utils/searchQuery";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { razorpay } from "../utils/razorpay";

const prisma = new PrismaClient();
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET as string;
export const searchHotels = async (req: Request, res: Response) => {
  try {
    const filters = constructSearchQuery(req.query);

    const sortOption = req.query.sortOption as string;

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
    const pageNumber = parseInt(req.query.page?.toString() || "1");
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await prisma.hotel.findMany({
      where: filters,
      orderBy,
      skip,
      take: pageSize,
    });

    const total = await prisma.hotel.count({
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
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
export const getHotelById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid hotel ID" });
    }

    const hotel = await prisma.hotel.findUnique({
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
  } catch (error) {
    console.error("Get Hotel By ID Error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllHotels = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [hotels, total] = await Promise.all([
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
  } catch (error) {
    console.error("Get All Hotels Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      adultCount,
      childCount,
      checkIn,
      checkOut,
      totalCost,
      hotelId,
    } = req.body;
    const userId = (req as any).user.id;
    const options = {
      amount: Math.round(totalCost * 100), // ₹ to paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    const booking = await prisma.booking.create({
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
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;
    const userId = (req as any).user.id;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId
    ) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature != razorpay_signature) {
      res.status(400).json({ message: "payment verification failed" });
      return;
    }
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: "paid",
      },
    });

    res.status(200).json({
      message: "Payment verified and booking successful",
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
