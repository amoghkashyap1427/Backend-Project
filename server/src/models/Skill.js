const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name must be at most 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Languages",
          "Frameworks",
          "Hardware-Robotics",
          "Cloud-DevOps",
        ],
        message: "{VALUE} is not a valid category",
      },
    },
    proficiency: {
      type: String,
      enum: {
        values: ["beginner", "intermediate", "advanced"],
        message: "{VALUE} is not a valid proficiency",
      },
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
  },
  { timestamps: true }
);

// Both the dashboard list and the public page filter on these two fields
skillSchema.index({ user: 1, isPublic: 1 });

module.exports = mongoose.model("Skill", skillSchema);
