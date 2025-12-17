'use strict';

const { QueryTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {

    return queryInterface.addColumn(
      'Assessment_indicator_answers',
      'valid',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }).then(() => {
        let sqlQuery = 'select count(*), max(timestamp), "assessmentId", "indicatorId" from "Assessment_indicator_answers" group by "assessmentId", "indicatorId" having count(*)>1';
        
        return queryInterface.sequelize.query(sqlQuery, { type: QueryTypes.SELECT }).then(async (duplicates) => {

          for (let duplicate of duplicates) {

            let sqlUpdate = 'update "Assessment_indicator_answers" set "valid"=false where "assessmentId"=? and "indicatorId"=? and ("timestamp" is null or "timestamp"<>?)';
            
            await queryInterface.sequelize.query(sqlUpdate, 
              {
                replacements: [
                  duplicate["assessmentId"],
                  duplicate["indicatorId"],
                  duplicate["max"]
                ]
              }
            );
          }
        });
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Assessment_indicator_answers', 'valid');
  }
};
