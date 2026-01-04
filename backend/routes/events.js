import express from "express";
import Event from "../models/Event.js";
import Child from "../models/Child.js";
import Item from "../models/Item.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { childId, type, label } = req.body;

    // Punish start
    if (type === "PUNISH_START") {
      const event = new Event({
        childId,
        type: "PUNISH_START",
        timestamp: new Date()
      });
      await event.save();
      return res.json(event);
    }

    //  Punish_end (duration + restriction logic)
    if (type === "PUNISH_END") {
      const lastStart = await Event.findOne({
        childId,
        type: "PUNISH_START"
      }).sort({ timestamp: -1 });

      if (!lastStart) {
        return res.status(400).json({ message: "No punish start found" });
      }

      const diffMs = new Date() - new Date(lastStart.timestamp);
      const minutes = Math.round(diffMs / 60000);

      const event = new Event({
        childId,
        type: "PUNISH_END",
        timestamp: new Date(),
        durationMinutes: minutes
      });

      await event.save();

      //  Count punishments today
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const punishToday = await Event.countDocuments({
        childId,
        type: "PUNISH_END",
        timestamp: { $gte: startOfToday }
      });

      //  si >= 3 → restrict until tomorrow + auto-return
      if (punishToday >= 3) {
        const child = await Child.findById(childId);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        child.isRestricted = true;
        child.restrictedUntil = tomorrow;

        if (child.currentItem) {
          const item = await Item.findOne({ name: child.currentItem });
          if (item) {
            item.isAvailable = true;
            await item.save();
          }

          const returnedItemName = child.currentItem;
          child.currentItem = "";

          const autoReturnEvent = new Event({
            childId: child._id,
            type: "LOAN_END",
            timestamp: new Date(),
            label: returnedItemName
          });
          await autoReturnEvent.save();
        }

        await child.save();
      }

      return res.json(event);
    }

    //  default events (CHECK_IN / CHECK_OUT / etc.)
    const event = new Event({
      childId,
      type,
      timestamp: new Date(),
      label: label || null
    });

    await event.save();

    //  update child status
    if (type === "CHECK_IN") {
      await Child.findByIdAndUpdate(childId, { status: "present" });
    }

    if (type === "CHECK_OUT") {
      await Child.findByIdAndUpdate(childId, { status: "absent" });
    }

    return res.json(event);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ childId: req.query.childId });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
