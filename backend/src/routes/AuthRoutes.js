import express from 'express';
import {login, register} from '../controllers/authControllers.js';
import { verifyToken } from '../middlewares/authMiddlewares.js';

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

export default router;