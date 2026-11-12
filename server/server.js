require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const connectMongoDB = require("./config/mongo");
const db = require("./models");

app.use(cors());
app.use(express.json());

const PORT = 3000;

const medicationRoutes = require("./routes/medicationRoutes");
const mongoMedicationRoutes = require("./routes/mongoMedicationRoutes");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");

app.get("/", (req, res) => {
    res.json({
        message: "Medication Control API is running"
    });
});

app.use("/medications", medicationRoutes);

app.use("/mongo/medications", mongoMedicationRoutes);

app.use("/auth", authRoutes);

app.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Доступ к профилю разрешён",
        user: req.user
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        error: "Internal server error"
    });
});

const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        console.log("PostgreSQL connected");

        await connectMongoDB();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Database connection error:", error.message);
        process.exit(1);
    }
};

startServer();