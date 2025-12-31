import mongoose from "mongoose";

const ChildSchema = new mongoose.Schema({
  name: String,
  status: String,
  isRestricted: Boolean
});

export default mongoose.model("Child", ChildSchema);
