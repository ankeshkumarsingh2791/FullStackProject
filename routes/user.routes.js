import express from "express";
import { registerUser, verifyUser } from "../controllers/User.controller.js";

const router = express.Router();
router.get("/register", registerUser)
router.get("/verify/:token", verifyUser)

export default router;