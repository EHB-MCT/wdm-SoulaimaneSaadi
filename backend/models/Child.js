import mongoose from "mongoose";

const ChildSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  status: String,
  isRestricted: Boolean,
  currentItem: String
});

export default mongoose.model("Child", ChildSchema);