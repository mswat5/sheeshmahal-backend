import { Router } from "express";
// import { getUserProfile } from "../controllers/user.controller";
import authenticateToken from "../middlewares/authenticateToken";

const router = Router();

// router.get("/getUserProfile", authenticateToken, getUserProfile);

// router.patch("/updateUserProfile", authenticateToken, getUserProfile);

export default router;
