import express from "express";
import Child from "../models/Child.js";

const router = express.Router();

// Create child
router.post("/", async (req, res) => {
  const child = new Child({
    name: req.body.name,
    status: "absent",
    isRestricted: false
  });

  await child.save();
  res.json(child);
});

// Get all children
router.get("/", async (req, res) => {
  const children = await Child.find();
  res.json(children);
});

// Get one child
router.get("/:id", async (req, res) => {
  const child = await Child.findById(req.params.id);
  res.json(child);
});

export default router;
