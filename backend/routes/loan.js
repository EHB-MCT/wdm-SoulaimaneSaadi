import express from "express";
import Child from "../models/Child.js";
import Item from "../models/Item.js";
import Event from "../models/Event.js";

const router = express.Router();

// TAKE ITEM
router.post("/take", async (req, res) => {
  const { childId, itemName } = req.body;

  const child = await Child.findById(childId);
  if (!child) return res.status(404).json({ message: "Child not found" });

  if (child.isRestricted) {
    return res.status(403).json({ message: "Restricted today" });
  }

  if (child.currentItem) {
    return res.status(400).json({ message: "Child already has an item" });
  }

  const item = await Item.findOne({ name: itemName });
  if (!item) return res.status(404).json({ message: "Item not found" });

  if (!item.isAvailable) {
    return res.status(400).json({ message: "Item not available" });
  }

  item.isAvailable = false;
  await item.save();

  child.currentItem = item.name;
  await child.save();

  const event = new Event({
    childId,
    type: "LOAN_START",
    timestamp: new Date(),
    label: item.name
  });
  await event.save();

  res.json({ message: "Loan OK", child });
});

// RETURN ITEM
router.post("/return", async (req, res) => {
  const { childId } = req.body;

  const child = await Child.findById(childId);
  if (!child) return res.status(404).json({ message: "Child not found" });

  if (!child.currentItem) {
    return res.status(400).json({ message: "No item to return" });
  }

  const itemName = child.currentItem;

  const item = await Item.findOne({ name: itemName });
  if (item) {
    item.isAvailable = true;
    await item.save();
  }

  child.currentItem = "";
  await child.save();

  const event = new Event({
    childId,
    type: "LOAN_END",
    timestamp: new Date(),
    label: itemName
  });
  await event.save();

  res.json({ message: "Return OK", child });
});

export default router;
