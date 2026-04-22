import express from "express";
import { getUsers, updateMyAvatar } from "../controllers/userControllers.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/", verifyToken, getUsers);
router.put("/me/avatar", verifyToken, updateMyAvatar);

export default router;
