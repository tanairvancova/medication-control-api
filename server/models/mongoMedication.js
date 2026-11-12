const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    time: {
        type: String,
        required: true
    },
    taken: {
        type: Boolean,
        default: false
    }
});

const medicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dosage: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    description: {
        type: String
    },
    schedule: [scheduleSchema]
}, {
    timestamps: true
});

const Medication = mongoose.model("Medication", medicationSchema);

module.exports = Medication;