const db = require('../../config/database');
const config = require('../../config/runtime')

function setIndicatorAnswer(req, res) {
    var userId;
    var role;

    if (req.user) {
        userId = req.user.id;
        role = req.user.role;
    } else {
        if (config.anonymous) {
            userId = 1;
            role = 1;
        }
    }
    let value = req.body.value;

    let rolePromise = Promise.resolve(role);
    if (role != 1) {
        rolePromise = db.assessments.findOne({
        where: {
            id: req.params.aId
        }
        }).then(a => {
        if (a.userId == userId) {
            role = 1;
        }
        return role;
        });
    }

    return rolePromise.then(role => {
        
        var permissionCheck;

        if (role == 1) {
            permissionCheck = Promise.resolve(true);
        } else {
            permissionCheck = db.user_assessment_indicator.findOne({
                where: {
                    userId: userId,
                    indicatorId: req.params.iId,
                    assessmentId: req.params.aId
                },
                include: [
                    {
                        model: db.user_indicator_privileges,
                        where: { role: "W" }
                    }
                ]
            });
        }

        return permissionCheck.then((p) => {
            if (p) {
                return db.assessment_indicator_answers.findOne({
                    where: {
                        valid: true,
                        assessmentId: req.params.aId,
                        indicatorId: req.params.iId
                    }
                }).then(a => {
                    let promise = Promise.resolve();
                    if (a) {
                        promise = a.update({
                            valid: false
                        });
                    }

                    return promise.then(() => {
                        if (value == null) {
                            return res.status(200).json({"success": true});
                        } else {
                            return db.assessment_indicator_answers.create({
                                userId: userId,
                                assessmentId: req.params.aId,
                                indicatorId: req.params.iId,
                                value: value,
                                timestamp: new Date()
                            }).then((data) => {
                                return res.status(201).json(data);
                            });
                        }
                    });
                });
            } else {
                return res.status(401).send();
            }
        });
    });
}

module.exports = setIndicatorAnswer;