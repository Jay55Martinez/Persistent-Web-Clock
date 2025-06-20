import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true,
// }));
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

export default app;