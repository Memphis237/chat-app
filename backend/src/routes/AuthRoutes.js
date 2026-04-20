import express from 'express';
import {login, register} from '../controllers/authControllers';
import { verifyToken } from '../middlewares/authMiddlewares';

const router = express.Router();

router.post("/auth/login", login);
router.post("/auth/register", register)