var exports = module.exports = {}

const express = require('express');
const db = require('../config/database');

// *** import database table schemas ***
const Users = db.users
const User_roles = db.user_roles
const User_indicator_privileges = db.user_indicator_privileges
const Nodes = db.nodes
const Node_descriptions = db.node_descriptions
const Pillars = db.pillars
const Pillar_descriptions = db.pillar_descriptions
const Themes = db.themes
const Theme_descriptions = db.theme_descriptions
const Assessment_types = db.assessment_types
const Indicators = db.indicators
const Indicator_descriptions = db.indicator_descriptions
const Indicator_thresholds = db.indicator_thresholds
const Indicator_threshold_descriptions = db.indicator_threshold_descriptions
const Assessment_type_descriptions = db.assessment_type_descriptions
const Assessments = db.assessments
const User_assessment_indicator = db.user_assessment_indicator
const Assessment_indicator_answers = db.assessment_indicator_answers
const Indicator_preference = db.indicator_preference
const Assessment_indicator_preferences = db.assessment_indicator_preferences

// function that returns all indicators
async function getAllIndicators(){
  let indicators = await Indicators.findAll({
    raw: true,
    include: [
      {
        model: Pillars,
        include:[{
        model:Pillar_descriptions
        }]
      },
      {
        model: Indicator_thresholds,
        include: [{
          model: Indicator_threshold_descriptions
        }]
      },
      {
        model: Indicator_descriptions
      }
    ]
  }).then(indicators => {
    console.log(indicators[55]);
    return indicators
  })
}

// function that returns all assessments
exports.getAllAssessments = async function getAllAssessments(req, res) {
  await Assessments.findAll({
    include: [
      {
        model: Assessment_indicator_answers,
        include: [
          {
            model: Indicators,
            include: [
              {
                model: Pillars,
                include: [{
                  model: Pillar_descriptions,
                  limit: 3
                }]
              },
              {
                model: Indicator_thresholds,
                include: [{
                  model: Indicator_threshold_descriptions,
                  limit: 3
                }]
              },
              {
                model: Indicator_descriptions
              }
            ]
          }
        ]
      }
    ]
  }).then(function (assessments) {

    /*

    console.log(assessments[0].Assessment_indicator_answers[0].Indicator.Indicator_thresholds[0].Indicator_threshold_descriptions[0].dataValues.name)
    console.log(assessments[0].dataValues.Indicator.dataValues.Indicator_thresholds[0])

    var neki = assessments[0].Assessment_indicator_answers[0].Indicator.Indicator_thresholds[1];
    console.log(neki.dataValues.valu); // how to get values out of json object

    */
    if(assessments.length == 0) return {};

    var assJSON = {}

    assJSON["assessment_name"] = assessments[0].name

    assJSON["assessment_answers"] = []

    for (ass in assessments[0].Assessment_indicator_answers) {

      var answer = {}

      answer["value"] = assessments[0].Assessment_indicator_answers[ass].value
      answer["pillar"] = assessments[0].Assessment_indicator_answers[ass].Indicator.Pillar.Pillar_descriptions[0].name

      for (i in assessments[0].Assessment_indicator_answers[ass].Indicator.Indicator_thresholds) {

        if (assessments[0].Assessment_indicator_answers[ass].Indicator.Indicator_thresholds[i].dataValues.valu == answer["value"]) {
          answer["value_description"] = assessments[0].Assessment_indicator_answers[ass].Indicator.Indicator_thresholds[i].Indicator_threshold_descriptions[0].dataValues.name
          break;
        }
        else {
          answer["value_description"] = null
        }
      }

      answer["indicator_name"] = assessments[0].Assesmsent_indicator_answers[ass].Indicator.Indicator_descriptions[0].dataValues.na

      assJSON["assessment_answers"].push(answer)

    }

    return assJSON

  }).then(response => {

    res.status(200).send(response);

  });
}

