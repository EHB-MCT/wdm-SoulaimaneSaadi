import express from "express";
import Child from "../models/Child.js";

const router = express.Router();

// Create child
router.post("/", async (req, res) => {
  try {
    const child = new Child({
      name: req.body.name,
      status: "absent",
      isRestricted: false,
    });

    await child.save();
    res.json(child);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// Get all children
router.get("/", async (req, res) => {
  try {
    const children = await Child.find();
    res.json(children);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

//  list of children 
router.get("/public", async (req, res) => {
  try {
    const children = await Child.find({}, "name status currentItem");
    res.json(children);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one child

router.get("/:id", async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) return res.status(404).json({ message: "Child not found" });
    res.json(child);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
