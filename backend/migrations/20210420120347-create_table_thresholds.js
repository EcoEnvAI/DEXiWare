'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Thresholds', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
  
      pillarId: {
        type: Sequelize.INTEGER
      },
  
      nodeId: {
        type: Sequelize.INTEGER
      },
  
      value: {
        type: Sequelize.INTEGER,
      },
  
      color: {
        type: Sequelize.STRING
      }
    }).then(() => {
      return queryInterface.createTable('Threshold_descriptions', {

        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
    
        thresholdId: {
          type: Sequelize.INTEGER,
          notEmpty: true
        },
    
        language: {
          type: Sequelize.STRING,
          notEmpty: true
        },
    
        name: {
          type: Sequelize.STRING,
          notEmpty: true
        },
    
        description: {
          type: Sequelize.TEXT,
        }
    
      });
    }).then(() => {
      return Promise.all([
        queryInterface.addConstraint('Threshold_descriptions', {
          fields: ['thresholdId'],
          type: 'FOREIGN KEY',
          name: 'Threshold_descriptions_thresholdId_fkey',
          references: {
            table: 'Thresholds',
            field: 'id'
          },
          onDelete: 'cascade'
        }),
        queryInterface.addConstraint('Thresholds', {
          fields: ['pillarId'],
          type: 'FOREIGN KEY',
          name: 'Thresholds_pillarId_fkey',
          references: {
            table: 'Pillars',
            field: 'id'
          },
          onDelete: 'cascade'
        }),
        queryInterface.addConstraint('Thresholds', {
          fields: ['nodeId'],
          type: 'FOREIGN KEY',
          name: 'Thresholds_nodeId_fkey',
          references: {
            table: 'Nodes',
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
