const mongoose = require("mongoose");

const openSourceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    repository: {
      type: String,
      required: [true, "Repository is required"],
      trim: true,
      maxlength: [200, "Repository must be at most 200 characters"],
    },
    prTitle: {
      type: String,
      required: [true, "PR title is required"],
      trim: true,
      maxlength: [200, "PR title must be at most 200 characters"],
    },
    prUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["open", "merged", "closed"],
        message: "{VALUE} is not a valid status",
      },
      default: "open",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description must be at most 2000 characters"],
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
openSourceSchema.index({ user: 1, isPublic: 1 });

module.exports = mongoose.model("OpenSource", openSourceSchema);
