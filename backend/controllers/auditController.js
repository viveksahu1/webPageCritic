const Audit = require("../models/Audit");

// ─── GET /api/audits — get all audits for logged-in user ──────────────────────
const getAudits = async (req, res) => {
  try {
    const audits = await Audit.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, audits });
  } catch (err) {
    console.error("getAudits error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch audits." });
  }
};

// ─── POST /api/audits — save a new audit report ───────────────────────────────
const saveAudit = async (req, res) => {
  try {
    const audit = await Audit.create({ user: req.user._id, ...req.body });
    res.status(201).json({ success: true, audit });
  } catch (err) {
    console.error("saveAudit error:", err);
    res.status(500).json({ success: false, error: "Failed to save audit." });
  }
};

// ─── DELETE /api/audits/:id — delete a single audit ──────────────────────────
const deleteAudit = async (req, res) => {
  try {
    const audit = await Audit.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id, // ensure ownership
    });
    if (!audit) return res.status(404).json({ success: false, error: "Audit not found." });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("deleteAudit error:", err);
    res.status(500).json({ success: false, error: "Failed to delete audit." });
  }
};

// ─── DELETE /api/audits — clear all audits for user ──────────────────────────
const clearAudits = async (req, res) => {
  try {
    await Audit.deleteMany({ user: req.user._id });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("clearAudits error:", err);
    res.status(500).json({ success: false, error: "Failed to clear audits." });
  }
};

module.exports = { getAudits, saveAudit, deleteAudit, clearAudits };