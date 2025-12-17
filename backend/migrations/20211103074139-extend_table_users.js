'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint("Users", {
      fields: ['email'],
      type: 'unique',
      name: 'users_email_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
  }
};
