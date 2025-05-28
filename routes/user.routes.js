import express from "express";
import { registerUser, verifyUser, LoginUser, getMe,logOutUser } from "../controllers/User.controller.js";
import {isLoggedIn}  from "../middlewares/Auth.middleware.js";


const router = express.Router();
router.post("/register", registerUser)
router.get("/verify/:token", verifyUser)
router.post("/login", LoginUser);
router.get("/profile", isLoggedIn, getMe)

router.post("/logout", isLoggedIn, logOutUser);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);


export default router;