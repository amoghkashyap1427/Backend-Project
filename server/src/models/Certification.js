const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema(
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
      maxlength: [200, "Title must be at most 200 characters"],
    },
    issuer: {
      type: String,
      required: [true, "Issuer is required"],
      trim: true,
      maxlength: [200, "Issuer must be at most 200 characters"],
    },
    credentialId: {
      type: String,
      trim: true,
    },
    verifyUrl: {
      type: String,
      trim: true,
    },
    completedOn: {
      type: Date,
    },
    fileUrl: {
      type: String,
      trim: true,
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
certificationSchema.index({ user: 1, isPublic: 1 });

module.exports = mongoose.model("Certification", certificationSchema);
