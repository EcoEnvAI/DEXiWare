'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Assessment_scenarios', {
 
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      
      assessmentId: {
        type: Sequelize.INTEGER,
        notEmpty: true
      },
  
      userId: {
        type: Sequelize.INTEGER,
        notEmpty: true
      },
  
      type: {
        type: Sequelize.STRING,
        notEmpty: true
      },
  
      content: {
        type: Sequelize.JSONB,
        notEmpty: true
      }
    }).then(() => {
      return Promise.all([
        queryInterface.addConstraint('Assessment_scenarios', {
          fields: ['assessmentId'],
          type: 'FOREIGN KEY',
          name: 'Assessment_scenarios_assessmentId_fkey',
          references: {
            table: 'Assessments',
            field: 'id'
          },
          onDelete: 'cascade'
        }),
        queryInterface.addConstraint('Assessment_scenarios', {
          fields: ['userId'],
          type: 'FOREIGN KEY',
          name: 'Assessment_scenarios_userId_fkey',
          references: {
            table: 'Users',
            field: 'id'
          },
          onDelete: 'cascade'
        })
      ]);
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
