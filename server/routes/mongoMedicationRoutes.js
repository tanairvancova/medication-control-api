const express = require("express");

const router = express.Router();

const {
    getAllMedications,
    getMedicationById,
    createMedication,
    updateMedication,
    deleteMedication,
    updateScheduleStatus
} = require("../controllers/mongoMedicationController");

router.get("/", getAllMedications);
router.get("/:id", getMedicationById);

router.post("/", createMedication);
router.put("/:id", updateMedication);
router.delete("/:id", deleteMedication);

router.patch("/:id/schedule/:scheduleId", updateScheduleStatus);

module.exports = router;