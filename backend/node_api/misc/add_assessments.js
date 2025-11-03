var db = require('../config/database');

const Assessment_types = db.assessment_types
const Assessment_type_descriptions = db.assessment_type_description
const Assessments = db.assessments
const Assessment_indicator_answers = db.assessment_indicator_answers
const Indicators = db.indicators
const Indicator_thresholds = db.indicator_thresholds
const Indicator_threshold_descriptions = db.indicator_threshold_descriptions
const assessment_name = "Test assessment "
const assessment_type_name = "Stročnice"

console.log(Assessment_type_descriptions);

/* Function to generate random answer */
const generateRandomNumber = len => {
    number = Math.floor((Math.random() * len) + 1)
    return number
};


console.log("Starting assessment import")

/* check if assessment type description already exists */
Assessment_type_descriptions.findOne({
    where: {
        name: assessment_type_name
    }
}).then(function (gottenAssessmentType) {
    if (gottenAssessmentType) {
        console.log("Assessment type already exists skipping...")
    } else {
        addAssessmentTypeAndDescription(assessment_type_name);
    }
});

/* Actual functions */

const addAssessmentTypeAndDescription = assessment_type_name => {
    /* create Assessment type */
    Assessment_types.create({
    }, function (err) {
        if (err) {
            console.error('error creating Assessment type', err.message);
        } else {
            console.log(' Assessment type created successfully');
        }
    }).then(function (type) {
        /* create new assessment type descriptions */
        Assessment_type_descriptions.create({
            assessment_typeId: type.id,
            language: 'English',
            modelPath: '/test/test',
        }, function (err) {
            if (err) {
                console.error('error creating Assessment type', err.message);
            } else {
                console.log(' Assessment type created successfully');
            }
        }).then(function (createdType_desc) {
            /* create new assessment */
            Assessments.create({
                name: assessment_name,
                language: 'English',
                createdAt: Date(),
                assessment_typeId: createdType_desc.assessment_typeId
            }, function (err) {
                if (err) {
                    console.error('error creating Assessment', err.message);
                } else {
                    console.log(' Assessment created successfully');
                }
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
        });
    });
}

const addAnswerToDb = async (indicatorId, assessmentId, lengthOfThresholds) => {
    value = generateRandomNumber(lengthOfThresholds);
    await Assessment_indicator_answers.create({
        indicatorId: indicatorId,
        assessmentId: assessmentId,
        value: value,
        userId: 1
    });
}