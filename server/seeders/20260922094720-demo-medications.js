'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Medications', [
            {
                name: 'Парацетамол',
                dosage: '500 мг',
                frequency: '2 раза в день',
                time: '09:00',
                startDate: '2026-09-21',
                endDate: '2026-09-25',
                description: 'Принимать после еды',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Ибупрофен',
                dosage: '200 мг',
                frequency: '1 раз в день',
                time: '20:00',
                startDate: '2026-09-21',
                endDate: '2026-09-24',
                description: 'Принимать после еды',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Medications', null, {});
    }
};