import express from "express";
import Admin from "../models/Admin.js";

const router = express.Router();

// Create admin
router.post("/create", async (req, res) => {
  const { email, password } = req.body;

  const alreadyExists = await Admin.findOne({ email });
  if (alreadyExists) {
    return res.status(400).json({ message: "Admin already exists" });
  }

  const admin = new Admin({ email, password });
  await admin.save();

  res.json(admin);
});

// Admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email, password });
  if (!admin) {
    return res.status(401).json({ message: "Wrong admin credentials" });
  }

  res.json(admin);
});

export default router;