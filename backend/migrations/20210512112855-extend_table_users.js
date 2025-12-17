'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Users',
      'confirmed',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    ).then(() => {
      return queryInterface.addColumn(
        'Users',
        'confirmationEmailDate',
        {
          type: Sequelize.DATE,
          allowNull: true
        }
      ); 
    }).then(() => {
      return queryInterface.sequelize.query('UPDATE "Users" SET confirmed=true');
    });
  },

  down: async (queryInterface, Sequelize) => {
    
  }
};
