const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models");

// Регистрация
const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Проверяем, что данные переданы
        if (!email || !password) {
            return res.status(400).json({
                error: "Email и пароль обязательны"
            });
        }

        // Проверяем сложность пароля
        if (
            password.length < 8 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[!@#$%^&*(),.?":{}|<>]/.test(password)
        ) {
            return res.status(400).json({
                error: "Пароль должен содержать минимум 8 символов, заглавную и строчную букву, цифру и специальный символ"
            });
        }

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                error: "Пользователь с таким email уже существует"
            });
        }

        // Хешируем пароль
        const passwordHash = await bcrypt.hash(password, 10);

        // Создаём пользователя
        const user = await User.create({
            email,
            passwordHash
        });

        res.status(201).json({
            message: "Пользователь успешно зарегистрирован",
            user: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Ошибка сервера"
        });
    }
};


// Авторизация
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Проверяем, что данные переданы
        if (!email || !password) {
            return res.status(400).json({
                error: "Email и пароль обязательны"
            });
        }

        // Ищем пользователя
        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                error: "Неверный email или пароль"
            });
        }

        // Сравниваем пароль с хешем
        const passwordMatch = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Неверный email или пароль"
            });
        }

        // Создаём JWT-токен
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            message: "Авторизация успешна",
            token
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Ошибка сервера"
        });
    }
};


module.exports = {
    register,
    login
};