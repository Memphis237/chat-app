import express from 'express';
import path from 'path';
import cors from 'cors';
import AuthRoutes from './AuthRoutes.js';
import ChatRoutes from './chatRoutes.js';
import UserRoutes from './userRoutes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use("/auth", AuthRoutes);
app.use("/chats", ChatRoutes);
app.use("/users", UserRoutes);

export default app;
