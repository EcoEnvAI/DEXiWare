const express = require('express');
const router = express.Router();
//const ensureLogin =  require('connect-ensure-login');
const ensureLogin =  require('../../common/ensure-login');

const controller = require('../../controller/assessment')
const getAssessments = require('./get_assessments');
const getUserPillars = require('./get_user_pillars');
const {createUser, addUser} = require('./add_user');
const getUsers = require('./get_users');
const getUserIndicators = require('./get_user_indicators');
const getPillarUserIndicators = require('./get_pillar_user_indicators');
const getPillarIndicators = require('./get_pillar_indicators');
const setUserAssessmentIndicator = require('./set_user_asessment_indicator');
const setIndicatorAnswer = require('./set_indicator_answer');
const saveScenario = require('./save_analysis_scenario');
const getScenarios = require('./get_scenarios');
const deleteScenario = require('./delete_scenario');
const createAssessment = require('./create_assessment');
const updateAssessment = require('./update_assessment');
const deleteAssessment = require('./delete_assessment');
const createDefaultAssessment = require('./create_default_assessment');

const analysisController = require('../../controller/analysis');

/**
 * @openapi
 * /api/assessment:
 *   get:
 *     summary: Get assessments
 *     tags:
 *       - Assessment
 *     responses:
 *       200:
 *         description: List of assessments
 */
router.get('/', ensureLogin.ensureLoggedIn(), getAssessments);
router.post('/', ensureLogin.ensureLoggedIn(), createAssessment);
router.post('/default', ensureLogin.ensureLoggedIn(), createDefaultAssessment);

/**
 * @openapi
 * /api/assessment/evaluate:
 *   post:
 *     summary: Evaluate generic task (legacy)
 *     tags:
 *       - Assessment
 */
router.post('/evaluate', controller.evaluate);

/**
 * @openapi
 * /api/assessment/{aId}:
 *   post:
 *     summary: Update assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/:aId', ensureLogin.ensureLoggedIn(), updateAssessment);

/**
 * @openapi
 * /api/assessment/{aId}:
 *   delete:
 *     summary: Delete assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:aId', ensureLogin.ensureLoggedIn(), deleteAssessment);

/**
 * @openapi
 * /api/assessment/{aId}/users:
 *   get:
 *     summary: Get users participating in assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:aId/users', getUsers);
/**
 * @openapi
 * /api/assessment/{aId}/user/{uId}:
 *   post:
 *     summary: Add existing user to assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: uId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/:aId/user/:uId', addUser);
/**
 * @openapi
 * /api/assessment/{aId}/user:
 *   post:
 *     summary: Create and add a new user to assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/:aId/user', createUser);

/**
 * @openapi
 * /api/assessment/{aId}/pillars:
 *   get:
 *     summary: Get pillars for assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:aId/pillars', ensureLogin.ensureLoggedIn(), getUserPillars);

/**
 * @openapi
 * /api/assessment/{aId}/indicators:
 *   get:
 *     summary: Get indicators for assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Indicators for the specified assessment
 */
router.get('/:aId/indicators', ensureLogin.ensureLoggedIn(), getUserIndicators);
/**
 * @openapi
 * /api/assessment/{aId}/pillars/{pId}/indicators:
 *   get:
 *     summary: Get user indicators for pillar in assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: pId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:aId/pillars/:pId/indicators', ensureLogin.ensureLoggedIn(), getPillarUserIndicators);
/**
 * @openapi
 * /api/assessment/{aId}/pillars/{pId}/indicators/all:
 *   get:
 *     summary: Get all indicators for pillar in assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: pId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:aId/pillars/:pId/indicators/all', ensureLogin.ensureLoggedIn(), getPillarIndicators);

// user assessment indicator
/**
 * @openapi
 * /api/assessment/{aId}/indicators/{iId}/users/{uId}:
 *   post:
 *     summary: Set indicator value for a user in assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: iId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: uId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/:aId/indicators/:iId/users/:uId', ensureLogin.ensureLoggedIn(), setUserAssessmentIndicator);
/**
 * @openapi
 * /api/assessment/{aId}/indicators/pillars/{pId}/users/{uId}:
 *   post:
 *     summary: Set pillar indicator value for a user in assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: pId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: uId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/:aId/indicators/pillars/:pId/users/:uId', ensureLogin.ensureLoggedIn(), setUserAssessmentIndicator);
/**
 * @openapi
 * /api/assessment/{aId}/indicators/pillars/{pId}/nodes/{nId}/users/{uId}:
 *   post:
 *     summary: Set node indicator value for a user in assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: pId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: nId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: uId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/:aId/indicators/pillars/:pId/nodes/:nId/users/:uId', ensureLogin.ensureLoggedIn(), setUserAssessmentIndicator);

// assessment indicator answer
/**
 * @openapi
 * /api/assessment/{aId}/indicators/{iId}:
 *   post:
 *     summary: Set indicator answer for assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: iId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/:aId/indicators/:iId', ensureLogin.ensureLoggedIn(), setIndicatorAnswer);

// assessment analysis scenario
/**
 * @openapi
 * /api/assessment/{aId}/scenario:
 *   post:
 *     summary: Save analysis scenario
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/:aId/scenario', ensureLogin.ensureLoggedIn(), saveScenario);
/**
 * @openapi
 * /api/assessment/{aId}/scenarios:
 *   get:
 *     summary: Get analysis scenarios for assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:aId/scenarios', ensureLogin.ensureLoggedIn(), getScenarios);
/**
 * @openapi
 * /api/assessment/{aId}/scenarios/{sId}:
 *   delete:
 *     summary: Delete analysis scenario
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sId
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:aId/scenarios/:sId', ensureLogin.ensureLoggedIn(), deleteScenario);

/**
 * @openapi
 * /api/assessment/{aId}/evaluate:
 *   post:
 *     summary: Evaluate assessment
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/:aId/evaluate', controller.evaluateAssessment);
/**
 * @openapi
 * /api/assessment/{aId}/bottom-up:
 *   post:
 *     summary: Bottom-up evaluation
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/:aId/bottom-up', controller.evaluateAssessmentBottomUp);
/**
 * @openapi
 * /api/assessment/{aId}/top-down:
 *   post:
 *     summary: Top-down evaluation
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: aId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/:aId/top-down', controller.evaluateAssessmentTopDown);

/**
 * @openapi
 * /api/assessment/evaluate/task/{task}:
 *   post:
 *     summary: Evaluate task
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: task
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/evaluate/task/:task', controller.evaluate);
/**
 * @openapi
 * /api/assessment/evaluate/task/{task}/model/{model}:
 *   post:
 *     summary: Evaluate task for specific model
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: task
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/evaluate/task/:task/model/:model', controller.evaluate);
/**
 * @openapi
 * /api/assessment/evaluate/task/{task}/root:
 *   post:
 *     summary: Evaluate task from root
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: task
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/evaluate/task/:task/root', controller.evaluateRoot);
/**
 * @openapi
 * /api/assessment/evaluate/task/{task}/model/{model}/root:
 *   post:
 *     summary: Evaluate task for model from root
 *     tags:
 *       - Assessment
 *     parameters:
 *       - in: path
 *         name: task
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/evaluate/task/:task/model/:model/root', controller.evaluateRoot);

module.exports = router;
