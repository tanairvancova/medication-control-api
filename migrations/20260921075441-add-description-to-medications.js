'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Medications', 'description', {
            type: Sequelize.TEXT,
            allowNull: true
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Medications', 'description');
    }
};
