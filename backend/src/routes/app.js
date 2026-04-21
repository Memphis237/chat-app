import express from 'express';
import cors from 'cors';
import AuthRoutes from './AuthRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", AuthRoutes);