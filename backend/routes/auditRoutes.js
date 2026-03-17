const express = require("express");
const { getAudits, saveAudit, deleteAudit, clearAudits } = require("../controllers/auditController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes protected
router.use(protect);

router.get("/",        getAudits);    // GET    /api/audits
router.post("/",       saveAudit);    // POST   /api/audits
router.delete("/",     clearAudits);  // DELETE /api/audits       (clear all)
router.delete("/:id",  deleteAudit);  // DELETE /api/audits/:id   (single)

module.exports = router;