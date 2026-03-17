const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    url: { type: String, required: true },

    // Core result fields from AI
    siteName:     { type: String },
    overallScore: { type: Number },
    verdict:      { type: String },
    summary:      { type: String },
    croMetrics:   { type: Array, default: [] },
    categories:   { type: Array, default: [] },
    issues:       { type: Array, default: [] },
    wins:         { type: Array, default: [] },
    ctaOptimization: { type: Array, default: [] },
    copyRewrites:    { type: Array, default: [] },
  },
  { timestamps: true }  // createdAt acts as the audit date
);

module.exports = mongoose.model("Audit", auditSchema);