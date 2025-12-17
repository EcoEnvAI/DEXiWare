const fs = require('fs').promises;
xml2js = require('xml2js');
var db = require('../config/database');
var config = require('../config/runtime');

global.__basedir = __dirname + '/../..';
var tasks = require('../config/tasks');

console.log("reading DXI file...")

let parser = new xml2js.Parser();

let path = __dirname + '/../business_logic/models/production/';

let promises = [];

parseModel = function (filepath, model_name) {
  return fs.readFile(filepath).then(data => {
    return new Promise((resolve, reject) => {
      parser.parseString(data, function (err, dexi) {
        if (err) {
          reject();
        } else {
          let root = getDexiStruct(dexi.DEXi);
          
          resolve({"name": model_name, "struct": root[0]});
        }
      });
    }) 
  })
}

for (let name in tasks.config.models) {
  let model = tasks.config.models[name];
  let item = model.model_filepath;
  if (model.model_type == 'dex') {
    promises.push(parseModel(path + item, name));
  }
}

Promise.all(promises).then(async dxiPillars => {
  let pillars = getPillars(dxiPillars);

  let themeList = extractThemes(pillars);
  let themes = await ensureThemes(themeList);

  for (let item of pillars) {
    // check if pillar already exists
    await db.pillar_descriptions.findOne({
      where: {
        name:item["name"]
      }
    }).then(async function(gotten_pillar) {
      var pillarId;
      if (gotten_pillar) {
        console.log(gotten_pillar.name+" already exists, skipping");
        pillarId = gotten_pillar["id"];
      } else {
        console.log("adding pillar "+item.name+" to the database");
        // add pillar to DB
        pillarId = await addPillar(item);
      }

      // add nodes
      for (let node of item.nodes) {
        await db.node_descriptions.findOne({
          where: {
            name:item["name"]
          }
        }).then(async function(gotten_node) {
          var nodeId;
          if (gotten_node) {
            console.log(gotten_node.name+" already exists, skipping");
            nodeId = gotten_node["id"];
          } else {
            console.log("adding node "+node+" to the database");
            // add node to DB
            if (config.pillar_models) {
              node['pillarId'] = pillarId;
            } else {
              node['pillarId'] = null;
            }
            nodeId = await addNode(node);

            // add indicators
            for (let indicator of node.indicators) {
              console.log("adding indicator "+indicator['name']+" to the database");

              indicator["pillarId"] = pillarId;
              indicator["nodeId"] = nodeId;
              if (indicator.themes.length > 0) {
                let themeName = indicator.themes[indicator.themes.length-1];
                let theme = themes.find(t => t.name == themeName);
                indicator["themeId"] = theme.id;
              }
              await addIndicator(indicator);
            }
          }
        });
      }
    });
  };
});

extractThemes = function(pillars) {
  let themes = [];
  for (let pillar of pillars) {
    for (let node of pillar.nodes) {
      for (let indicator of node.indicators) {
        let root = themes;
        for (let theme of indicator.themes) {
          let item = root.find(t => t.name == theme);
          
          if (!item) {
            item = {name: theme, children: []};
            root.push(item);
          }
          root = item.children;
        }
      }
    }
  }
  return themes;
}


ensureThemes = async function (themes, parentId) {
  for (let theme of themes) {
    let dbTheme = {};

    if (parentId != null) {
      dbTheme.themeId = parentId;
    }

    var lastId;

    await db.themes.create(dbTheme).then((t) => {
      return db.theme_descriptions.create({themeId: t.id, language: "English", name: theme.name});
    }).then((td) => {
      return ensureThemes(theme.children, td.themeId);
    });
  }

  return await db.theme_descriptions.findAll(); 
}

getPillars = function (dxiPillars) {
  let pillars = [];

  for (let pillar of dxiPillars) {
    let modelName = pillar.name;
    let pillarName = Object.keys(pillar.struct)[0];
    let pillarNodes = getNodes(pillar.struct[pillarName].body);
    let pillarRatings = pillar.struct[pillarName].ratings;

    pillars.push({name: pillarName, model: modelName, nodes: pillarNodes, ratings: pillarRatings});
  }

  return pillars;
}

getNodes = function (dxiNodes) {
  let nodes = [];
  let idx = 1;

  for (let node of dxiNodes) {
    let nodeName = Object.keys(node)[0];
    let nodeIndicators = getIndicators(node[nodeName].body);
    let nodeRatings = node[nodeName].ratings;
    nodes.push({name: nodeName, description: nodeName, idx: idx++, indicators: nodeIndicators, ratings: nodeRatings});
  }

  return nodes;
}

getIndicators = function (dxiIndicators) {
  let indicators = [];

  for (let theme of dxiIndicators) {
    let themeName = Object.keys(theme)[0];
    
    if (!theme[themeName].body) {
      let details = theme[themeName];
      indicators.push({name: themeName, description: details.description, ratings: details.ratings, themes: []});
    } else {
      let themeIndicators = getIndicators(theme[themeName].body);
      for (let indicator of themeIndicators) {
          indicator.themes.push(themeName);
      }
      indicators = indicators.concat(themeIndicators);
    }
  }

  return indicators;
}

getDexiStruct = function (dexi) {
  return dexi.ATTRIBUTE.map(a => {
    let key = a["NAME"][0];
    let retval = {};
    if (a["ATTRIBUTE"]) {
      if (a["SCALE"]) {
        retval[key] = {"body": getDexiStruct(a), "ratings": getDexiRatings(a["SCALE"][0])};
      } else {
        retval[key] = {"body": getDexiStruct(a)};
      }
        
    } else {
      // indicator
      let description = '';
      if (a["DESCRIPTION"]) {
        description = a["DESCRIPTION"][0];
      }
      retval[key] = {"description": description, "ratings": getDexiRatings(a["SCALE"][0])};
        
    }
    return retval;
  });
}

getDexiRatings = function(dexi) {
  return dexi.SCALEVALUE.map(sv => {
    let value = "orange";
    if (sv["GROUP"] == "BAD") {
      value = "red";
    } else if (sv["GROUP"] == "GOOD") {
      value = "green";
    }
    let description = null;
    if (Array.isArray(sv["DESCRIPTION"])) {
      description = sv["DESCRIPTION"][0];
    }
      
    return {"name": sv["NAME"][0], "value": value, "description": description};
  });
}

// add Pillar
function addPillar(item) {
  return db.pillars.create(item, function(err) {
    if (err){
      console.error('error creating pillar', err.message);
    }else{
      console.log(item+' Pillar created successfully');
    }
  }).then(function(created_pillar){
    return db.pillar_descriptions.create({
      name: item["name"],
      description: item["name"],
      language: "English",
      pillar_id: created_pillar.id
    }).then(() => {
        return created_pillar.id;
    });
  }).then(function(id) {
    var value = 1;
    let promises = [];
    item.ratings.forEach(function(rating, i){
      promises.push(createRatings(rating["name"], id, null, (value+i), rating["description"], rating["value"]));
    });

    return Promise.all(promises).then(() => id);
  });
}

// add Node
function addNode(item) {
  return db.nodes.create({
    name: item["name"],
    pillarId: item["pillarId"],
    idx: item["idx"]
  }, function(err) {
    if (err) {
      console.error('error creating Node', err.message);
    } else {
      console.log(item + ' Node created successfully');
    }
  }).then(function(created_node){
    return db.node_descriptions.create({
      name: item["name"],
      description: item["description"],
      language: "English",
      node_id: created_node.id
    }).then(() => created_node.id);
  }).then(function(id) {
    var value = 1;
    let promises = [];
    item.ratings.forEach(function(rating, i){
      promises.push(createRatings(rating["name"], null, id, (value+i), rating["description"], rating["value"]));
    });

    return Promise.all(promises).then(() => id);
  });
}

// function for creating ratings
function createRatings(rating, pillarId, nodeId, value, description, color){
  return db.thresholds.create({
    pillarId: pillarId,
    nodeId: nodeId,
    value: value,
    color: color
  }).then(function(gotten_threshold){
    return db.threshold_descriptions.create({
      thresholdId: gotten_threshold.id,
      language: "English",
      name: rating,
      description: description
    });
  });
}

function addIndicator(item) {
  return db.indicators.create({
    pillarId: item.pillarId,
    nodeId: item.nodeId,
    themeId: item.themeId,
    assessment_typeId: null
  }).then(indicator => {
    return db.indicator_descriptions.create({
      indicatorId: indicator.id,
      language: "English",
      name: item.name,
      metrics: "",
      description: item.description
    }).then(() => {

      var value = 1;
      var promises = [];
      item.ratings.forEach(function(rating, i){
        promises.push(createIndicatorRatings(rating["name"], indicator.id, (value+i), rating["description"], rating["value"]));
      });

      return Promise.all(promises);
    });
  });
}


// function for creating indicator ratings
function createIndicatorRatings(rating, indicatorId, value, description, color){
  return db.indicator_thresholds.create({
    indicatorId: indicatorId,
    value: value,
    color: color
  }).then(function(gotten_threshold){
    return db.indicator_threshold_descriptions.create({
      thresholdId: gotten_threshold.id,
      language: "English",
      name: rating,
      description: description
    });
  });
}