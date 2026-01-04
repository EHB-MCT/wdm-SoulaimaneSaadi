import express from "express";
import Child from "../models/Child.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingChild = await Child.findOne({ email });
    if (existingChild) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const child = new Child({
      name,
      email,
      password,
      status: "absent",
      isRestricted: false,
      currentItem: ""
    });

    await child.save();
    res.json(child);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const child = await Child.findOne({ email, password });
    if (!child) {
      return res.status(401).json({ message: "Wrong credentials" });
    }

    res.json(child);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;