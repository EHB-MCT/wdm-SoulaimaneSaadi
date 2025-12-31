import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.log("Mongo error:", err.message));

// Health check
app.get("/health", (req, res) => {
  res.send("Backend running");
});

// Start server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
