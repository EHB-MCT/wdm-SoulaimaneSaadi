import express from "express";
import Event from "../models/Event.js";
import Child from "../models/Child.js";

const router = express.Router();

// Create event
router.post("/", async (req, res) => {
  const event = new Event({
    childId: req.body.childId,
    type: req.body.type,
    timestamp: new Date()
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
});

// ) Get events by childId
router.get("/", async (req, res) => {
  const events = await Event.find({
    childId: req.query.childId
  });

  res.json(events);
});

export default router;
