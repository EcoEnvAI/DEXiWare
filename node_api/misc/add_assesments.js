var db = require('../config/database');

const Assesment_types = db.assesment_types
const Assesment_type_descriptions = db.assesment_type_description
const Assesments = db.assesments
const Assesment_indicator_answers = db.assesment_indicator_answers
const Indicators = db.indicators
const Indicator_thresholds = db.indicator_thresholds
const Indicator_threshold_descriptions = db.indicator_threshold_descriptions
const assesment_name = "Test assesment "
const assesment_type_name = "Stročnice"

console.log(Assesment_type_descriptions);

/* Function to generate random answer */
const generateRandomNumber = len => {
    number = Math.floor((Math.random() * len) + 1)
    return number
};


console.log("Starting assesment import")

/* check if assesment type description already exists */
Assesment_type_descriptions.findOne({
    where: {
        name: assesment_type_name
    }
}).then(function (gottenAssesmentType) {
    if (gottenAssesmentType) {
        console.log("Assesment type already exists skipping...")
    } else {
        addAssesmentTypeAndDescription(assesment_type_name);
    }
});

/* Actual functions */

const addAssesmentTypeAndDescription = assesment_type_name => {
    /* create Assesment type */
    Assesment_types.create({
    }, function (err) {
        if (err) {
            console.error('error creating Assesment type', err.message);
        } else {
            console.log(' Assesment type created successfully');
        }
    }).then(function (type) {
        /* create new assesment type descriptions */
        Assesment_type_descriptions.create({
            assesment_typeId: type.id,
            language: 'English',
            modelPath: '/test/test',
        }, function (err) {
            if (err) {
                console.error('error creating Assesment type', err.message);
            } else {
                console.log(' Assesment type created successfully');
            }
        }).then(function (createdType_desc) {
            /* create new assesment */
            Assesments.create({
                name: assesment_name,
                language: 'English',
                createdAt: Date(),
                assesment_typeId: createdType_desc.assesment_typeId
            }, function (err) {
                if (err) {
                    console.error('error creating Assesment', err.message);
                } else {
                    console.log(' Assesment created successfully');
                }
            }).then(function (gottenAssesment) {
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
                        /* check if answer already exists */
                        const lengthOfThresholds = items.dataValues.Indicator_thresholds.length;                        
                        Assesment_indicator_answers.findOne({
                            where: {
                                indicatorId: items.id,
                                assesmentId: gottenAssesment.id
                            }
                        }).then(function (foundAnswer) {
                            if (foundAnswer) {
                                console.log("Answer already exists skipping");
                            } else {
                                /* add answer to db */
                                addAnswerToDb(items.id, gottenAssesment.id,lengthOfThresholds);
                            }
                        });
                    });
                });
            });
        });
    });
}

const addAnswerToDb = async (indicatorId, assesmentId, lengthOfThresholds) => {
    value = generateRandomNumber(lengthOfThresholds);
    await Assesment_indicator_answers.create({
        indicatorId: indicatorId,
        assesmentId: assesmentId,
        value: value,
        userId: 1
    });
}