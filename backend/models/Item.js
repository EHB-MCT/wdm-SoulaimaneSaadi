import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  name: String,
  isAvailable: Boolean
});

export default mongoose.model("Item", ItemSchema);