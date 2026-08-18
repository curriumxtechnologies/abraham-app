import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns'; // 👈 added for DNS resolution fix

import userRoutes from './routes/userRoutes.js';
import allocationRoutes from './routes/allocationRoutes.js';
import checkInRoutes from './routes/checkInRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import { handlePaystackWebhook } from './controllers/hostelAllocationController.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();
dotenv.config();

// Fix DNS SRV resolution issues on Windows/VPN
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myapp';

// ─── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
  'https://localhost',
  'http://localhost:1000',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`❌ CORS blocked origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// ─── Webhook (must be BEFORE bodyParser.json) ──────────────────
app.post('/api/hostel/webhook', express.raw({ type: 'application/json' }), handlePaystackWebhook);

// ─── JSON & URL‑encoded parsers ─────────────────────────────────
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ──────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("AB app API is running 🚀");
});

app.use('/api/users', userRoutes);
app.use('/api/hostel', allocationRoutes);
app.use('/api/checkin', checkInRoutes);
app.use('/api/complaints', complaintRoutes);

// ─── Error handling ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── MongoDB connection ──────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));