// server.js

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});


