const medications = require("../models/medicationModel");

const getAllMedications = (req, res) => {
    res.json(medications);
};

const getMedicationById = (req, res) => {
    const id = Number(req.params.id);

    const medication = medications.find(item => item.id === id);

    if (!medication) {
        return res.status(404).json({
            error: "Medication not found"
        });
    }

    res.json(medication);
};

const createMedication = (req, res) => {
    const {
        name,
        dosage,
        frequency,
        time,
        startDate,
        endDate
    } = req.body;

    if (!name || !dosage || !frequency || !time || !startDate || !endDate) {
        return res.status(400).json({
            error: "All medication fields are required"
        });
    }

    const newMedication = {
        id: medications.length > 0
            ? Math.max(...medications.map(item => item.id)) + 1
            : 1,
        name,
        dosage,
        frequency,
        time,
        startDate,
        endDate
    };

    medications.push(newMedication);

    res.status(201).json(newMedication);
};

const updateMedication = (req, res) => {
    const id = Number(req.params.id);

    const medicationIndex = medications.findIndex(item => item.id === id);

    if (medicationIndex === -1) {
        return res.status(404).json({
            error: "Medication not found"
        });
    }

    const {
        name,
        dosage,
        frequency,
        time,
        startDate,
        endDate
    } = req.body;

    if (!name || !dosage || !frequency || !time || !startDate || !endDate) {
        return res.status(400).json({
            error: "All medication fields are required"
        });
    }

    const updatedMedication = {
        id,
        name,
        dosage,
        frequency,
        time,
        startDate,
        endDate
    };

    medications[medicationIndex] = updatedMedication;

    res.json(updatedMedication);
};

const deleteMedication = (req, res) => {
    const id = Number(req.params.id);

    const medicationIndex = medications.findIndex(item => item.id === id);

    if (medicationIndex === -1) {
        return res.status(404).json({
            error: "Medication not found"
        });
    }

    const deletedMedication = medications.splice(medicationIndex, 1);

    res.json({
        message: "Medication deleted successfully",
        medication: deletedMedication[0]
    });
};

module.exports = {
    getAllMedications,
    getMedicationById,
    createMedication,
    updateMedication,
    deleteMedication
};