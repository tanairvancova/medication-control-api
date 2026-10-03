const { Medication } = require("../models");

const getAllMedications = async (req, res) => {
    try {
        const medications = await Medication.findAll();

        res.json(medications);
    } catch (error) {
        res.status(500).json({
            error: "Failed to get medications"
        });
    }
};

const getMedicationById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const medication = await Medication.findByPk(id);

        if (!medication) {
            return res.status(404).json({
                error: "Medication not found"
            });
        }

        res.json(medication);
    } catch (error) {
        res.status(500).json({
            error: "Failed to get medication"
        });
    }
};

const createMedication = async (req, res) => {
    try {
        const {
            name,
            dosage,
            frequency,
            time,
            startDate,
            endDate,
            description
        } = req.body;

        if (!name || !dosage || !frequency || !time || !startDate || !endDate) {
            return res.status(400).json({
                error: "All medication fields are required"
            });
        }

        const medication = await Medication.create({
            name,
            dosage,
            frequency,
            time,
            startDate,
            endDate,
            description
        });

        res.status(201).json(medication);
    } catch (error) {
        res.status(500).json({
            error: "Failed to create medication"
        });
    }
};

const updateMedication = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const medication = await Medication.findByPk(id);

        if (!medication) {
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
            endDate,
            description
        } = req.body;

        if (!name || !dosage || !frequency || !time || !startDate || !endDate) {
            return res.status(400).json({
                error: "All medication fields are required"
            });
        }

        await medication.update({
            name,
            dosage,
            frequency,
            time,
            startDate,
            endDate,
            description
        });

        res.json(medication);
    } catch (error) {
        res.status(500).json({
            error: "Failed to update medication"
        });
    }
};

const deleteMedication = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const medication = await Medication.findByPk(id);

        if (!medication) {
            return res.status(404).json({
                error: "Medication not found"
            });
        }

        await medication.destroy();

        res.json({
            message: "Medication deleted successfully",
            medication
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete medication"
        });
    }
};

module.exports = {
    getAllMedications,
    getMedicationById,
    createMedication,
    updateMedication,
    deleteMedication
};
