var db = require('../config/database');
const { Op } = require('sequelize');

const Assessment_types = db.assessment_types
const Assessment_type_descriptions = db.assessment_type_description
const Assessments = db.assessments
const Assessment_indicator_answers = db.assessment_indicator_answers
const Indicators = db.indicators
const Indicator_thresholds = db.indicator_thresholds
const Indicator_threshold_descriptions = db.indicator_threshold_descriptions
const assessment_name = "Test assessment"
const assessment_type_name = "Stročnice"

async function seedAssessments() {
    console.log("Starting assessment import")

    /* check if assessment type description already exists */

    const language = 'English';
    const existingTypeDesc = await Assessment_type_descriptions.findOne({
        where: {
            name: assessment_type_name,
            language
        }
    });

    let assessmentTypeId;
    if (existingTypeDesc) {
        console.log("Assessment type already exists skipping...")
        assessmentTypeId = existingTypeDesc.assessment_typeId;
    } else {
        const type = await Assessment_types.create({});
        const createdTypeDesc = await Assessment_type_descriptions.create({
            assessment_typeId: type.id,
            language,
            name: assessment_type_name,
            modelPath: '/test/test'
        });
        assessmentTypeId = createdTypeDesc.assessment_typeId;
    }

    const existingAssessment = await Assessments.findOne({
        where: {
            assessment_typeId: assessmentTypeId,
            name: { [Op.in]: [assessment_name, `${assessment_name} `] }
        }
    });

    if (existingAssessment) {
        console.log("Test assessment already exists skipping...")
        return;
    }

    await Assessments.create({
        name: assessment_name,
        language,
        createdAt: new Date(),
        assessment_typeId: assessmentTypeId
    });/*.then(function (gottenAssessment) {
                Indicators.findAll({
                    include: [
                        {
                            model: Indicator_thresholds,
                            include: [{
                                model: Indicator_threshold_descriptions,
                                limit: 5
                            }]
                        }]
                }).then(function (listIndicator) {
                    listIndicator.forEach(function (items, i) {
                        const lengthOfThresholds = items.dataValues.Indicator_thresholds.length;                        
                        Assessment_indicator_answers.findOne({
                            where: {
                                indicatorId: items.id,
                                assessmentId: gottenAssessment.id
                            }
                        }).then(function (foundAnswer) {
                            if (foundAnswer) {
                                console.log("Answer already exists skipping");
                            } else {
                                addAnswerToDb(items.id, gottenAssessment.id,lengthOfThresholds);
                            }
                        });
                    });
                });
            });*/
}

/* Function to generate random answer */
const generateRandomNumber = len => {
    number = Math.floor((Math.random() * len) + 1)
    return number
};

/* Actual functions */


if (require.main === module) {
    seedAssessments()
        .then(() => db.sequelize.close())
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err);
            return db.sequelize.close()
                .catch(() => undefined)
                .finally(() => process.exit(1));
        });
}

module.exports = { seedAssessments };