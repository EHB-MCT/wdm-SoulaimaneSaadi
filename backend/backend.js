import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import childrenRoutes from "./routes/children.js";
import eventsRoutes from "./routes/events.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/children", childrenRoutes);
app.use("/events", eventsRoutes);

// health check
app.get("/health", (req, res) => {
  res.send("Backend running");
});

//  mongo connect with start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongo connected");
    app.listen(PORT, () => console.log("Server running on port " + PORT));
  })
  .catch((err) => console.log("Mongo error:", err.message));
