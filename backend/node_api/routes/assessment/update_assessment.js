const db = require('../../config/database');

function updateAssessment(req, res) {
    return db.assessments.findOne({where: {id: req.params.aId}}).then((assessment) => {
        if (assessment) {
            return assessment.update({name: req.body.name}).then(() => {
                return res.status(200).send();
            });
        } else {
            return res.status(404).send();
        }
    });
}

module.exports = updateAssessment