import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import childrenRoutes from "./routes/children.js";
import eventsRoutes from "./routes/events.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/auth", authRoutes);
app.use("/children", childrenRoutes);
app.use("/events", eventsRoutes);

//  check
app.get("/health", (req, res) => {
  res.send("Backend running");
});

// mongo connection +  start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });
  })
  .catch((err) => {
    console.error("MongoDB error:", err);
  });
