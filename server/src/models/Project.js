const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title must be at most 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description must be at most 2000 characters"],
    },
    repoUrl: { type: String, trim: true },
    liveUrl: { type: String, trim: true },
    architecture: { type: String, trim: true },
    techStack: [{ type: String, trim: true }],
    media: [{ type: String, trim: true }],
    isPublic: { type: Boolean, default: false },
    tags: [{ type: String, trim: true, lowercase: true }],
  },
  { timestamps: true }
);

// Both the dashboard list and the public page filter on these two fields
projectSchema.index({ user: 1, isPublic: 1 });

module.exports = mongoose.model("Project", projectSchema);