import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  childId: mongoose.Schema.Types.ObjectId,
  type: String,
  timestamp: Date,
  label: String,
  durationMinutes: Number
});

export default mongoose.model("Event", EventSchema);