// server.js

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

// Make the Connection to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.log("Mongo error:", err.message));

// Route test => health check 
app.get("/health", (req, res) => {
  res.send("Backend running");
});

// Launche the server 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
