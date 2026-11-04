const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Проверяем наличие заголовка Authorization
    if (!authHeader) {
        return res.status(401).json({
            error: "Требуется авторизация"
        });
    }

    // Проверяем формат Bearer <token>
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
            error: "Неверный формат токена"
        });
    }

    const token = parts[1];

    try {
        // Проверяем JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Сохраняем данные пользователя в req.user
        req.user = decoded;

        // Передаём управление следующему обработчику
        next();

    } catch (error) {
        return res.status(401).json({
            error: "Недействительный или просроченный токен"
        });
    }
};

module.exports = authMiddleware;