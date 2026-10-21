const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
      maxlength: [120, "Company must be at most 120 characters"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
      maxlength: [120, "Role must be at most 120 characters"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      trim: true,
    },
    techStack: [{ type: String, trim: true }],
    bullets: [{ type: String, trim: true }],
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
  },
  { timestamps: true }
);

// Both the dashboard list and the public page filter on these two fields
experienceSchema.index({ user: 1, isPublic: 1 });

module.exports = mongoose.model("Experience", experienceSchema);
