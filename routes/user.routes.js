import express from "express";
import { registerUser, verifyUser, LoginUser } from "../controllers/User.controller.js";

const router = express.Router();
router.post("/register", registerUser)
router.get("/verify/:token", verifyUser)
router.post("/login", LoginUser);

export default router;