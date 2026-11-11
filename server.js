require("dotenv").config();

const express = require("express");

const app = express();

const PORT = 3000;

const medicationRoutes = require("./routes/medicationRoutes");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");

const items = [
    {
        id: 1,
        name: "Парацетамол",
        dose: "500 мг",
        time: "09:00"
    },
    {
        id: 2,
        name: "Ибупрофен",
        dose: "200 мг",
        time: "14:00"
    },
    {
        id: 3,
        name: "Витамин D",
        dose: "1 таблетка",
        time: "20:00"
    }
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "./views");

const logger = (req, res, next) => {
    const time = new Date().toLocaleString();
    console.log(`${req.method} ${req.url} ${time}`);
    next();
};

app.use(logger);

const demoAuthMiddleware = (req, res, next) => {
    if (req.query.auth === "1") {
        req.user = {
            name: "Пользователь"
        };
    } else {
        req.user = {
            name: "Гость"
        };
    }

    next();
};

app.use(demoAuthMiddleware);

app.get("/", (req, res) => {
    res.render("index", {
        items: items,
        user: req.user
    });
});

app.get("/item/:id", (req, res) => {
    const id = Number(req.params.id);

    const item = items.find((item) => item.id === id);

    if (!item) {
        return res.status(404).render("404");
    }

    res.render("item", {
        item: item,
        user: req.user
    });
});

app.get("/add", (req, res) => {
    res.render("add", {
        user: req.user
    });
});

app.post("/add", (req, res) => {
    const newItem = {
        id: items.length + 1,
        name: req.body.name,
        dose: req.body.dose,
        time: req.body.time
    };

    items.push(newItem);

    res.redirect("/?auth=1");
});

app.get("/test-error", (req, res, next) => {
    next(new Error("Тестовая ошибка сервера"));
});

app.use("/medications", medicationRoutes);
app.use("/auth", authRoutes);

app.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Доступ к профилю разрешён",
        user: req.user
    });
});

app.use((req, res) => {
    res.status(404).render("404");
});

app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).render("500", {
        error: err
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});