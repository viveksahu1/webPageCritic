const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const { authLimiter } = require("./middleware/rateLimiter");

const authRoutes    = require("./routes/authRoutes");
const analyzeRoutes = require("./routes/analyzeRoutes");
const auditRoutes   = require("./routes/auditRoutes");

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*", credentials: true }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",    authLimiter, authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/audits",  auditRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
const mongoose = require("mongoose");
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));