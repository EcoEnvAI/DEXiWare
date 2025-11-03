'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Indicator_thresholds',
      'color',
      {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: ''
      });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Indicator_thresholds', 'color');
  }
};
