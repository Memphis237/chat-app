import express from "express";
import { getChats, getMessages } from "../controllers/chatControllers.js";
import { createGroup } from "../controllers/groupControllers.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/", verifyToken, getChats);
router.get("/:id/messages", verifyToken, getMessages);
router.post("/groups", verifyToken, createGroup);

export default router;
