const Medication = require("../models/mongoMedication");

const getAllMedications = async (req, res) => {
    try {
        const search = req.query.search || "";

        const where = {};

        if (search) {
            where.name = {
                $regex: search,
                $options: "i"
            };
        }

        const medications = await Medication.find(where).sort({
            createdAt: -1
        });

        res.json(medications);
    } catch (error) {
        res.status(500).json({
            error: "Failed to get medications"
        });
    }
};

const getMedicationById = async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id);

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
            description,
            schedule
        } = req.body;

        const medication = await Medication.create({
            name,
            dosage,
            frequency,
            time,
            startDate,
            endDate,
            description,
            schedule
        });

        res.status(201).json(medication);
    } catch (error) {
        res.status(400).json({
            error: "Failed to create medication",
            details: error.message
        });
    }
};

const updateMedication = async (req, res) => {
    try {
        const medication = await Medication.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!medication) {
            return res.status(404).json({
                error: "Medication not found"
            });
        }

        res.json(medication);
    } catch (error) {
        res.status(400).json({
            error: "Failed to update medication",
            details: error.message
        });
    }
};

const deleteMedication = async (req, res) => {
    try {
        const medication = await Medication.findByIdAndDelete(
            req.params.id
        );

        if (!medication) {
            return res.status(404).json({
                error: "Medication not found"
            });
        }

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

const updateScheduleStatus = async (req, res) => {
    try {
        if (typeof req.body.taken !== "boolean") {
            return res.status(400).json({
                error: "Taken must be a boolean"
            });
        }

        const medication = await Medication.findOneAndUpdate(
            {
                _id: req.params.id,
                "schedule._id": req.params.scheduleId
            },
            {
                $set: {
                    "schedule.$.taken": req.body.taken
                }
            },
            {
                new: true
            }
        );

        if (!medication) {
            return res.status(404).json({
                error: "Medication or schedule not found"
            });
        }

        res.json(medication);
    } catch (error) {
        res.status(500).json({
            error: "Failed to update schedule",
            details: error.message
        });
    }
};

module.exports = {
    getAllMedications,
    getMedicationById,
    createMedication,
    updateMedication,
    deleteMedication,
    updateScheduleStatus
};