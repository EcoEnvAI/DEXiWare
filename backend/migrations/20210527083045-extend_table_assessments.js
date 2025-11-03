'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Assessments',
      'userId',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    ).then(() => {
      queryInterface.addConstraint('Assessments', {
        fields: ['userId'],
        type: 'FOREIGN KEY',
        name: 'Assessments_userId_fkey',
        references: {
          table: 'Users',
          field: 'id'
        },
        onDelete: 'cascade'
      })
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
