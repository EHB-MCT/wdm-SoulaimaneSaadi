import express from "express";
import Event from "../models/Event.js";
import Child from "../models/Child.js";

const router = express.Router();

// Create event
router.post("/", async (req, res) => {
  try {
    const event = new Event({
      childId: req.body.childId,
      type: req.body.type,
      timestamp: new Date(),
      label: req.body.label
    });

    await event.save();

    // influence simple
    if (req.body.type == "PUNISH") {
      const punishCount = await Event.countDocuments({
        childId: req.body.childId,
        type: "PUNISH"
      });

      if (punishCount >= 3) {
        await Child.findByIdAndUpdate(req.body.childId, {
          isRestricted: true
        });
      }
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get events by childId
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({
      childId: req.query.childId
    });

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
