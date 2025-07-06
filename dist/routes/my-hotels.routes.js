"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = __importDefault(require("../middlewares/authenticateToken"));
const my_hotel_controller_1 = require("../controllers/my-hotel.controller");
const multer_1 = __importDefault(require("../utils/multer"));
const hotel_controller_1 = require("../controllers/hotel.controller");
const router = (0, express_1.Router)();
router.post("/", authenticateToken_1.default, multer_1.default.array("images"), my_hotel_controller_1.createHotel);
router.put("/:hotelId", authenticateToken_1.default, multer_1.default.array("images"), my_hotel_controller_1.updateHotel);
router.get("/me", authenticateToken_1.default, my_hotel_controller_1.getMyHotel);
router.get("/me/:id", authenticateToken_1.default, my_hotel_controller_1.getMyHotelById);
// router.get("/public/:id", getHotelByIdPublic);
router.get("/search", hotel_controller_1.searchHotels);
router.get("/public", hotel_controller_1.getAllHotels);
exports.default = router;
