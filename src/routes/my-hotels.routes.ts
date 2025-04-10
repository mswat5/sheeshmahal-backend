import { Router } from "express";

import authenticateToken from "../middlewares/authenticateToken";
import {
  createHotel,
  getMyHotel,
  getMyHotelById,
  updateHotel,
} from "../controllers/my-hotel.controller";
import upload from "../utils/multer";
import { searchHotels } from "../controllers/hotel.controller";

const router = Router();

router.post("/", authenticateToken, upload.array("images"), createHotel);
router.put("/:hotelId", authenticateToken, upload.array("images"), updateHotel);
router.get("/me", authenticateToken, getMyHotel);
router.get("/me/:id", authenticateToken, getMyHotelById);
// router.get("/public/:id", getHotelByIdPublic);
router.get("/search", searchHotels);
// router.get("/", getAllPublicHotels);
export default router;
