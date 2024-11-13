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
const Assesment_types = db.assesment_types
const Indicators = db.indicators
const Indicator_descriptions = db.indicator_descriptions
const Indicator_thresholds = db.indicator_thresholds
const Indicator_threshold_descriptions = db.indicator_threshold_descriptions
const Assesment_type_descriptions = db.assesment_type_descriptions
const Assesments = db.assesments
const User_assesment_indicator = db.user_assesment_indicator
const Assesment_indicator_answers = db.assesment_indicator_answers
const Indicator_preference = db.indicator_preference
const Assesment_indicator_preferences = db.assesment_indicator_preferences

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

// function that returns all assesments
exports.getAllAssesments = async function getAllAssesments(req, res) {
  await Assesments.findAll({
    include: [
      {
        model: Assesment_indicator_answers,
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
  }).then(function (assesments) {

    /*

    console.log(assesments[0].Assesment_indicator_answers[0].Indicator.Indicator_thresholds[0].Indicator_threshold_descriptions[0].dataValues.name)
    console.log(assesments[0].dataValues.Indicator.dataValues.Indicator_thresholds[0])

    var neki = assesments[0].Assesment_indicator_answers[0].Indicator.Indicator_thresholds[1];
    console.log(neki.dataValues.valu); // how to get values out of json object

    */
    if(assesments.length == 0) return {};

    var assJSON = {}

    assJSON["assesment_name"] = assesments[0].name

    assJSON["assesment_answers"] = []

    for (ass in assesments[0].Assesment_indicator_answers) {

      var answer = {}

      answer["value"] = assesments[0].Assesment_indicator_answers[ass].value
      answer["pillar"] = assesments[0].Assesment_indicator_answers[ass].Indicator.Pillar.Pillar_descriptions[0].name

      for (i in assesments[0].Assesment_indicator_answers[ass].Indicator.Indicator_thresholds) {

        if (assesments[0].Assesment_indicator_answers[ass].Indicator.Indicator_thresholds[i].dataValues.valu == answer["value"]) {
          answer["value_description"] = assesments[0].Assesment_indicator_answers[ass].Indicator.Indicator_thresholds[i].Indicator_threshold_descriptions[0].dataValues.name
          break;
        }
        else {
          answer["value_description"] = null
        }
      }

      answer["indicator_name"] = assesments[0].Assesment_indicator_answers[ass].Indicator.Indicator_descriptions[0].dataValues.na

      assJSON["assesment_answers"].push(answer)

    }

    return assJSON

  }).then(response => {

    res.status(200).send(response);

  });
}

