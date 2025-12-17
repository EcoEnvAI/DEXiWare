const db = require('../config/database');
const fs = require('fs');

console.log("Starting import");

var args = process.argv.slice(2);

(async () => {
    if (args[0]) {
        let raw = fs.readFileSync(args[0]);
        let json = JSON.parse(raw);
    
        for (let pillarName in json["pillars"]) {
            for (let nodeName in json["pillars"][pillarName]["nodes"]) {
                for (let indicatorName in json["pillars"][pillarName]["nodes"][nodeName]["indicators"]) {
                    let indicatorValue = json["pillars"][pillarName]["nodes"][nodeName]["indicators"][indicatorName];
    
                    if (indicatorValue != "") {
                        console.log("Inserting " + pillarName + "/" + nodeName + "/" + indicatorName + ": " + indicatorValue);
                        await insertIndicatorAnswer(pillarName, nodeName, indicatorName, indicatorValue);
                    } else {
                        console.log("Skipping " + pillarName + "/" + nodeName + "/" + indicatorName);
                    }
                    console.log(indicatorName + ": " + indicatorValue);
                }
            }
        }
    } else {
        console.log("Specify file");
    }    

    console.log('Done.');
})();



function insertIndicatorAnswer(pillarName, nodeName, indicatorName, indicatorValue) {
    return db.pillar_descriptions.findOne({where: {name: pillarName}}).then((pillar) => {
        if (pillar) {
            let pillarId = pillar.pillar_id;
            
            return db.node_descriptions.findOne({where: {description: nodeName}}).then((node) => {
                if (node) {
                    let nodeId = node.node_id;

                    return db.indicators.findOne({
                        where: {
                            nodeId: nodeId,
                            pillarId: pillarId
                        }, include: [{
                            model: db.indicator_descriptions,
                        where: {
                            name: indicatorName
                        }}
                    ]}).then((indicator) => {
                        if (indicator) {
                            let indicatorId = indicator.id;

                            return db.indicator_thresholds.findAll({
                                where: {indicatorId: indicatorId},
                                include: [{ model: db.indicator_threshold_descriptions }],
                                order: ['id']
                            }).then((thresholds) => {
                                let value = 0;
                                for (let i = 0; i < thresholds.length; i++) {
                                    if (thresholds[i].Indicator_threshold_descriptions[0].name.toUpperCase() == indicatorValue.toUpperCase()) {
                                        value = i + 1;
                                    }
                                }
                                if (value > 0) {
                                    return db.assessment_indicator_answers.create({
                                        indicatorId: indicatorId,
                                        assessmentId: 1,
                                        value: value,
                                        userId: 1
                                    });
                                } else {
                                    throw new Error("Threshold " + indicatorValue + " not found on indicator " + indicatorName);
                                }
                            });
                        } else {
                            throw new Error("Indicator " + indicatorName + " not found");
                        }
                    });
                } else {
                    throw new Error("Node " + nodeName + " not found");
                }
            });
        } else {
            throw new Error("Pillar " + pillarName + " not found");
        }
    });
}
