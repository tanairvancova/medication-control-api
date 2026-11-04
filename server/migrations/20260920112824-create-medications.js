'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Medications', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            dosage: {
                type: Sequelize.STRING,
                allowNull: false
            },
            frequency: {
                type: Sequelize.STRING,
                allowNull: false
            },
            time: {
                type: Sequelize.STRING,
                allowNull: false
            },
            startDate: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            endDate: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('Medications');
    }
};
