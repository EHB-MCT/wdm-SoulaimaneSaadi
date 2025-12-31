import mongoose from "mongoose";

const ChildSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  status: String,
  isRestricted: Boolean
});

export default mongoose.model("Child", ChildSchema);
