import express from 'express';
import cors from 'cors';

const app = express();

app.cors();
app.use(express.json());
app.use("/auth/login", AuthRoutes);
app.use("/auth/register, AuthRoutes");