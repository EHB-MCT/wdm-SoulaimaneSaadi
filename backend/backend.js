import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import childrenRoutes from "./routes/children.js";
import eventsRoutes from "./routes/events.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import itemRoutes from "./routes/items.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/children", childrenRoutes);
app.use("/events", eventsRoutes);
app.use("/admin", adminAuthRoutes);
app.use("/items", itemRoutes);

app.get("/health", (req, res) => {
  res.send("Backend running");
});

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
