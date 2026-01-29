const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "completed", "deleted"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
