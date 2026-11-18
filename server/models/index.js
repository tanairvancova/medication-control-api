const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config.json');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
    process.env.DB_NAME || dbConfig.database,
    process.env.DB_USER || dbConfig.username,
    process.env.DB_PASSWORD || dbConfig.password,
    {
        host: process.env.DB_HOST || dbConfig.host,
        dialect: dbConfig.dialect,
        port: process.env.DB_PORT || dbConfig.port
    }
);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Medication = require('./medication')(sequelize, DataTypes);
db.User = require('./user')(sequelize, DataTypes);

module.exports = db;