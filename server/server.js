require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ],
        methods: ["GET", "POST"]
    }
});

const connectMongoDB = require("./config/mongo");
const db = require("./models");

app.use(cors());
app.use(express.json());

const PORT = 3000;
const MEDICATION_ROOM = "medication-updates";

app.set("io", io);

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

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.join(MEDICATION_ROOM);

    socket.to(MEDICATION_ROOM).emit("user connected", {
        message: "Пользователь подключился"
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        io.to(MEDICATION_ROOM).emit("user disconnected", {
            message: "Пользователь отключился"
        });
    });
});

const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        console.log("PostgreSQL connected");

        await connectMongoDB();

        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log("Socket.IO server is ready");
        });
    } catch (error) {
        console.error("Database connection error:", error.message);
        process.exit(1);
    }
};

startServer();