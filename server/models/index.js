const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config.json');

const sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    {
        host: config.development.host,
        dialect: config.development.dialect,
        port: config.development.port
    }
);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Medication = require('./medication')(sequelize, DataTypes);
db.User = require('./user')(sequelize, DataTypes);

module.exports = db;