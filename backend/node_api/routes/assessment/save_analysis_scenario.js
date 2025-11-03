const db = require('../../config/database');

function saveAnalysisScenario(req, res) {
    let type = req.body.type;
    let content = req.body.content;

    let scenario = {
        "assessmentId": req.params.aId,
        "userId": req.user.id,
        "type": type,
        "content": content
    };
    return db.assessment_scenarios.create(scenario).then((ret) => {
        return res.status(201).send();
    });
}

module.exports = saveAnalysisScenario;