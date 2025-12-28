import express from "express";
import Event from "../models/Event.js";
import Child from "../models/Child.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const event = new Event({
      childId: req.body.childId,
      type: req.body.type
    });

    await event.save();

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

export default router;
