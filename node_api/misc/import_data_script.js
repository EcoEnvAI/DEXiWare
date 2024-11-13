const fs = require('fs');
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


// *** BEGIN READING JSON FILE ***
console.log("reading JSON file...")
let rawdata = fs.readFileSync('indicators.json');
let data = JSON.parse(rawdata);


console.log("Adding Pillars into the database...");

// we need pillar names to be in an array to add them to the database
var pillars = [];
var nodes = new Set();
var indicators = new Set();
// format pillars and nodes into an array and set for easier database insertion
for(pillar in data){
  pillars.push(pillar);
  for(iter in data[pillar]){
    for(new_iter in data[pillar][iter]){
      nodes.add(data[pillar][iter]['NODE']);
      // add pillar name to indicator data
      data[pillar][iter]['PILLAR'] = pillar;
      indicators.add(data[pillar][iter]);
    }
  }
}


// *** Add each Pillar into database ***
pillars.forEach(function(item, i ){

  // check if pillar already exists
  Pillar_descriptions.findOne({
    where: {
      name:item
    }
  }).then(function(gotten_pillar){
    if(gotten_pillar){
      console.log(gotten_pillar.name+" already exists skipping");
    }else{
      console.log("adding "+item+" to the database");
      // add pillar to DB
      addPillar(item);
    }
  });
});

// *** Add each Node into database ***
nodes.forEach(function(item, i){

  // check if Node already exists
  Node_descriptions.findOne({
    where: {
      name:item
    }
  }).then(function(gotten_node){
    if(gotten_node){
      console.log(gotten_node.name+" already exists skipping");
    }else{
      console.log("adding "+item+" to the database");
      // add Node to DB
      addNode(item);
    }
  });

});

indicators.forEach(function(item, i){

  // check if Indicator already exists
  Indicator_descriptions.findOne({
    where: {
      name: item['INDICATOR_NAME']
    }
  }).then(function(gotten_indicator){
    if(gotten_indicator){
      console.log(gotten_indicator.name+" already exists skipping");
    }else{
      console.log("adding "+item['INDICATOR_NAME']+" to the database");
      // add indicator to DB
      addIndicator(item);
    }
  });
});

// *** Async functions ***
// add Pillar
async function addPillar(item){
  Pillars.create({
  }, function(err){
    if (err){
      console.error('error creating pillar', err.message);
    }else{
      console.log(item+' Pillar created successfully');
    }
  }).then(function(created_pillar){
    Pillar_descriptions.create({
      name: item,
      language: "English",
      pillar_id: created_pillar.id
    });
  });
}

// add Node
async function addNode(item){
  Nodes.create({
    name:item
  }, function(err) {
    if (err) {
      console.error('error creating Node', err.message);
    } else {
      console.log(item + ' Node created successfully');
    }
  }).then(function(created_node){
      Node_descriptions.create({
        name: item,
        language: "English",
        node_id: created_node.id
      });
    });
}

// add Indicator
async function addIndicator(item){
  var array_of_themes = [];
  var indicator_pillar = item["PILLAR"];
  var indicator_node = item["NODE"];
  var metrics = item["METRICS"];
  var indicator_desc = item["DESCRIPTION"];
  var ratings = item["RATINGS"];
  var ratings_description = item["RATINGS_DESCRIPTIONS"];
  var indicator_name = item["INDICATOR_NAME"];

  // add all themes that have values
  for(name in item){
    //console.log(item[name]);
    if(name.includes("THEME") && item[name] !== "") {
      array_of_themes.push(item[name]);
    }
  }

  array_of_themes.reverse();
  var previous_theme_id = null;
  const add_to_database = async (previous_theme_id,indicator_pillar,indicator_node,metrics,indicator_desc,ratings,ratings_description,indicator_name) => {
      await asyncForEach(array_of_themes,async function(item){
        previous_theme_id = await createTheme(item, previous_theme_id);
      });
      // first get proper Node and pillar id
      var nodeId = 0;
      var pillarId = 0;
      // find Pillar
      Pillar_descriptions.findOne({
        where: {
          name: indicator_pillar
        }
      }).then(function(gotten_pillar){
        pillarId = gotten_pillar.pillar_id;
        // find Node
        Node_descriptions.findOne({
          where:{
            name: indicator_node
          }
        }).then(function(gotten_node){
          nodeId = gotten_node.node_id;
          // add indicator to database
          Indicators.create({
            pillarId: pillarId,
            nodeId: nodeId,
            themeId: previous_theme_id,
            assesment_typeId: null

          }).then(function(gotten_indicator){
            // add indicator description to database
            Indicator_descriptions.create({
              indicatorId: gotten_indicator.id,
              language: "English",
              name: indicator_name,
              metrics: metrics[0],
              description: indicator_desc[0]
            }).then(function(gotten_ind_desc){
              var indId = gotten_ind_desc.indicatorId;
              var value = 1;
              // add indicator thresholds and threshold descriptions
              ratings.forEach(function(item,i){
                createRatings(item,indId,(value+i),ratings_description[i]);
              });
            });
          });
        });
      });
  };
  // call add_to_database function and add indicator, metrics and ratings to the database
  add_to_database(previous_theme_id,indicator_pillar,indicator_node,metrics,indicator_desc,ratings,ratings_description,indicator_name);
  console.log("*** FINISHED IMPORTING INTO DATABASE ***");
}

// function for creating ratings
async function createRatings(rating, indicatorId, value, description){
  Indicator_thresholds.create({
    indicatorId: indicatorId,
    value: value
  }).then(function(gotten_threshold){
    Indicator_threshold_descriptions.create({
      thresholdId: gotten_threshold.id,
      language: "English",
      name: rating,
      description: description
    });
  });
}

async function createTheme(theme, previous_theme_id){
  var value = 0;
  await Themes.create({
    themeId: previous_theme_id
  }).then(function(gotten_theme){
      value = gotten_theme.id;
      Theme_descriptions.create({
        themeId: gotten_theme.id,
        language: "English",
        name: theme,
    });
  });
  return value;
}

async function asyncForEach(array, callback){
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


