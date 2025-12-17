const fs = require('fs');
const { exit } = require('process');
const path = require('path');
var db = require('../config/database');

console.log("Starting database import...");

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
const Assessment_type_descriptions = db.assessment_type_description
const Assessments = db.assessments
const User_assessment_indicator = db.user_assessment_indicator
const Assessment_indicator_answers = db.assessment_indicator_answers
const Indicator_preference = db.indicator_preference
const Assessment_indicator_preferences = db.assessment_indicator_preferences

stripParens = function(name) {
  let item = name;
  let parts = item.split(" (");
  if (parts.length > 1) {
    item = parts[0];
  }
  return item;
}

idxFromParens = function(item) {
  idx = null;
  let parts = item.split(" (");
  if (parts.length > 1) {
    item = parts[1];
    try {
      idx = parseInt(item[item.length-2]);
      
    } catch {
      // no idx
    }
  }
  return idx;
}

// *** BEGIN READING JSON FILE ***
console.log("reading JSON file...")
const indicatorsPath = process.env.INDICATORS_JSON_PATH || path.join(__dirname, '../misc/indicators.json');
let rawdata = fs.readFileSync(indicatorsPath);
let data = JSON.parse(rawdata);


console.log("Adding Privileges into database...");
const privilegesPromise = Promise.all([
  User_indicator_privileges.findOrCreate({ where: { role: 'W' }, defaults: { role: 'W' } }),
  User_indicator_privileges.findOrCreate({ where: { role: 'R' }, defaults: { role: 'R' } })
]).catch((err) => {
  console.error('error creating privileges', err);
});

console.log("Adding Pillars into the database...");

// we need pillar names to be in an array to add them to the database
var pillars = [];
var nodes = new Set();
var nodeIdxs = {};
var indicators = new Set();
// format pillars and nodes into an array and set for easier database insertion
for (pillar in data){
  pillars.push({"name": pillar, "description": data[pillar]["DESCRIPTION"], "model": data[pillar]["MODEL_KEY"]});
  let pillarIndicators = data[pillar]["INDICATORS"];
  for (iter in pillarIndicators){
    let nodeName = pillarIndicators[iter]['NODE'];
    let nodeIdx = idxFromParens(pillarIndicators[iter]['NODE_DESCRIPTION']);
    let existing = Array.from(nodes).find(n=>n.name==nodeName);
    if (!existing) {
      nodes.add({"name": nodeName, "description": stripParens(pillarIndicators[iter]['NODE_DESCRIPTION'])});
    }
    if (!nodeIdxs[nodeName]) {
      nodeIdxs[nodeName] = nodeIdx;
    }
    // add pillar name to indicator data
    pillarIndicators[iter]['PILLAR'] = pillar;
    indicators.add(pillarIndicators[iter]);
  }
}

async function seedPillarsAndNodes() {
  // *** Add each Pillar into database ***
  for (const item of pillars) {
    const gotten_pillar = await Pillar_descriptions.findOne({
      where: {
        name: item["name"]
      }
    });

    if (gotten_pillar) {
      console.log(gotten_pillar.name + " already exists, skipping");
    } else {
      console.log("adding pillar " + item + " to the database");
      await addPillar(item);
    }
  }

  // *** Add each Node into database ***
  for (const item of nodes) {
    const gotten_node = await Node_descriptions.findOne({
      where: {
        name: item["name"]
      }
    });

    if (gotten_node) {
      console.log(gotten_node.name + " already exists, skipping");
    } else {
      console.log("adding node " + item + " to the database");
      await addNode(item, nodeIdxs[item["name"]]);
    }
  }
}

async function main() {
  await privilegesPromise;
  await seedPillarsAndNodes();
  await addIndicators(indicators);
}

main()
  .then(() => {
    console.log("DONE.");
  })
  .then(() => db.sequelize.close())
  .then(() => exit(0))
  .catch((err) => {
    console.error(err);
    return db.sequelize.close()
      .catch(() => undefined)
      .finally(() => exit(1));
  });

// *** Async functions ***
// add Pillar
async function addPillar(item){
  const created_pillar = await Pillars.create(item);
  await Pillar_descriptions.create({
    name: item["name"],
    description: item["description"],
    language: "English",
    pillar_id: created_pillar.id
  });
}

// add Node
async function addNode(item, idx){
  const created_node = await Nodes.create({
    name:item["name"],
    idx: idx
  });
  await Node_descriptions.create({
    name: item["name"],
    description: item["description"],
    language: "English",
    node_id: created_node.id
  });
}

// function for creating ratings
function createRatings(rating, indicatorId, value, description, color){
  return Indicator_thresholds.create({
    indicatorId: indicatorId,
    value: value,
    color: color
  }).then(function(gotten_threshold){
    return Indicator_threshold_descriptions.create({
      thresholdId: gotten_threshold.id,
      language: "English",
      name: rating,
      description: description
    });
  });
}

function createTheme(theme, previous_theme_id){
  return Themes.create({
    "themeId": previous_theme_id
  }).then(function(gotten_theme){
      return Theme_descriptions.create({
        "themeId": gotten_theme.id,
        "language": "English",
        "name": theme,
    }).then(() => {
      return gotten_theme.id;
    });
  }); 
}


async function addThemes(themes) {
  var previous_theme_id = null;
  for (let theme of themes) {
    previous_theme_id = await createTheme(theme, previous_theme_id);
  }

  return previous_theme_id;
}

// add Indicator
function addIndicator(indicator) {
  var array_of_themes = [];
  var indicator_pillar = indicator["PILLAR"];
  var indicator_node = indicator["NODE"];
  var metrics = indicator["METRICS"];
  var indicator_desc = indicator["DESCRIPTION"];
  var ratings = indicator["RATINGS"];
  var indicator_name = indicator["INDICATOR_NAME"];

  // add all themes that have values
  for (name in indicator) {
    //console.log(item[name]);
    if (name.includes("THEME") && indicator[name] !== "") {
      array_of_themes.push(indicator[name]);
    }
  }
  //array_of_themes.reverse();

  return Pillar_descriptions.findOne({
    where: {
      name: indicator_pillar
    }
  }).then(pillar => {
    if (!pillar) {
      console.warn(`pillar not found for indicator ${indicator_name}: ${indicator_pillar}`);
      return;
    }

    let pillarId = pillar.pillar_id;
    // find Node
    return Node_descriptions.findOne({
      where: {
        name: indicator_node
      }
    }).then(node => {
      if (!node) {
        console.warn(`node not found for indicator ${indicator_name}: ${indicator_node}`);
        return;
      }

      let nodeId = node.node_id;

      return Indicator_descriptions.findOne({
        where: {
          name: indicator_name,
          language: 'English'
        },
        include: [
          {
            model: Indicators,
            where: {
              pillarId: pillarId,
              nodeId: nodeId
            },
            required: true
          }
        ]
      }).then((existing) => {
        if (existing) {
          console.log(`indicator ${indicator_name} already exists for ${indicator_pillar}/${indicator_node}, skipping`);
          return;
        }

        return addThemes(array_of_themes).then((last_theme_id) => {
          return Indicators.create({
            pillarId: pillarId,
            nodeId: nodeId,
            themeId: last_theme_id,
            assessment_typeId: null
          }).then(indicator => {
            return Indicator_descriptions.create({
              indicatorId: indicator.id,
              language: "English",
              name: indicator_name,
              metrics: metrics[0],
              description: indicator_desc[0]
            }).then(() => {
              var value = 1;
              var promises = [];
              ratings.forEach(function(item, i){
                promises.push(createRatings(item["NAME"], indicator.id, (value+i), item["DESCRIPTION"], item["VALUE"]));
              });

              return Promise.all(promises);
            });
          });
        });
      });
    });
  });
}

async function addIndicators(indicators) {
  for (let item of indicators) {
    console.log("adding indicator "+item['INDICATOR_NAME']+" to the database");
    await addIndicator(item);
  }
}