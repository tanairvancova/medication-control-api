require("dotenv").config();

const express = require("express");

const app = express();

const PORT = 3000;

const medicationRoutes = require("./routes/medicationRoutes");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Medication Control API is running"
    });
});

app.use("/medications", medicationRoutes);

app.use("/auth", authRoutes);

// Защищённый маршрут профиля
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});