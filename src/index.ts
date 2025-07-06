import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import hotelRoutes from "./routes/my-hotels.routes";
import bookingRoutes from "./routes/my-bookings.routes";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3000",
      "https://sheeshmahall.vercel.app",
    ],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.send("api is running");
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
