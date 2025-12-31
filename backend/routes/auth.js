import express from "express";
import Child from "../models/Child.js";

const router = express.Router();

// Register a new child
router.post("/register", async (req, res) => {
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
    isRestricted: false
  });

  await child.save();
  res.json(child);
});

export default router;
