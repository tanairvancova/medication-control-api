const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    'medication_control',
    'tanairvancova',
    '',
    {
        host: '127.0.0.1',
        dialect: 'postgres'
    }
);

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Подключение к PostgreSQL успешно!');
    } catch (error) {
        console.error('Ошибка подключения:', error);
    } finally {
        await sequelize.close();
    }
}

testConnection();
