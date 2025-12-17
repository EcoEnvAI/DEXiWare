'use strict';

const { QueryTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Assessment_users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
  
      assessmentId: {
        type: Sequelize.INTEGER,
        notEmpty: true,
        references: {model: 'Assessments', key: 'id'}
      },
  
      userId: {
        type: Sequelize.INTEGER,
        notEmpty: true,
        references: {model: 'Users', key: 'id'}
      }
    }).then(() => {
      // select id, "assessmentId" from "Users" where "assessmentId" is not null;
      // select "id", "userId" from "Assessments" where "userId" is not null;
      return queryInterface.sequelize.query('select id, "assessmentId" from "Users" where "assessmentId" is not null', { type: QueryTypes.SELECT }).then((ua) => {
        let assessments = {};
        for (let item of ua) {
          if (assessments[item["assessmentId"]] === undefined) {
            assessments[item["assessmentId"]] = [];
          }
          assessments[item["assessmentId"]].push(item["id"]);
        }
        return assessments;
      }).then((assessments) => {
        return queryInterface.sequelize.query('select "id", "userId" from "Assessments" where "userId" is not null', { type: QueryTypes.SELECT }).then((au) => {
          for (let item of au) {
            if (assessments[item["id"]] === undefined) {
              assessments[item["id"]] = [];
            }
            if (!assessments[item["id"]].includes(item["userId"])) {
              assessments[item["id"]].push(item["userId"]);
            }
          }
          let data = [];
          for (let assessmentId of Object.keys(assessments)) {
            for (let userId of assessments[assessmentId]) {
              data.push({"assessmentId": assessmentId, "userId": userId});
            }
          }
          if (data.length === 0) {
            return;
          } else {
            return queryInterface.bulkInsert("Assessment_users", data);
          }
        });
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Assessment_users');
  }
};
