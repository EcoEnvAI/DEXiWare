const express = require('express');
const router = express.Router();
//const ensureLogin =  require('connect-ensure-login');
const ensureLogin =  require('../../common/ensure-login');
const modelStructureController =  require('../../controller/structure');

// const controller = require('../../controller/structure');
const getPillars = require('./get_pillars');
const getNodes = require('./get_nodes');
const indicators = require('./get_indicators');
const getUsers = require('./get_users');
const createUser = require('./create_user');
const {registerUser, sendConfirmationLink} = require('./register_user');

/**
 * @openapi
 * /api/structure/pillars:
 *   get:
 *     summary: Get pillars
 *     tags:
 *       - Structure
 */
router.get('/pillars', ensureLogin.ensureLoggedIn(), getPillars);
/**
 * @openapi
 * /api/structure/pillars/{pId}/indicators:
 *   get:
 *     summary: Get indicators for pillar
 *     tags:
 *       - Structure
 *     parameters:
 *       - in: path
 *         name: pId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/pillars/:pId/indicators', ensureLogin.ensureLoggedIn(), indicators.getPillarIndicators);
/**
 * @openapi
 * /api/structure/nodes:
 *   get:
 *     summary: Get nodes
 *     tags:
 *       - Structure
 */
router.get('/nodes', ensureLogin.ensureLoggedIn(), getNodes);
/**
 * @openapi
 * /api/structure/pillars/{pId}/nodes/{nId}/indicators:
 *   get:
 *     summary: Get indicators for node in pillar
 *     tags:
 *       - Structure
 *     parameters:
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
 */
router.get('/pillars/:pId/nodes/:nId/indicators', ensureLogin.ensureLoggedIn(), indicators.getNodeIndicators);
/**
 * @openapi
 * /api/structure/users:
 *   get:
 *     summary: Get users
 *     tags:
 *       - Structure
 */
router.get('/users', ensureLogin.ensureLoggedIn(), getUsers);
/**
 * @openapi
 * /api/structure/users:
 *   post:
 *     summary: Create user
 *     tags:
 *       - Structure
 */
router.post('/users', ensureLogin.ensureLoggedIn(), createUser);
/**
 * @openapi
 * /api/structure/users:
 *   put:
 *     summary: Register user
 *     tags:
 *       - Structure
 */
router.put('/users', registerUser);


/**
 * @openapi
 * /api/structure/inputs:
 *   get:
 *     summary: Get model inputs
 *     tags:
 *       - Structure
 */
router.get('/inputs', [modelStructureController.getModelInputs]);
/**
 * @openapi
 * /api/structure/inputs/model/{model}:
 *   get:
 *     summary: Get model inputs for model
 *     tags:
 *       - Structure
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/inputs/model/:model', [modelStructureController.getModelInputs]);
/**
 * @openapi
 * /api/structure/attributes:
 *   get:
 *     summary: Get model attributes
 *     tags:
 *       - Structure
 */
router.get('/attributes', [modelStructureController.getModelAttributes]);
/**
 * @openapi
 * /api/structure/attributes/model/{model}:
 *   get:
 *     summary: Get model attributes for model
 *     tags:
 *       - Structure
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/attributes/model/:model', [modelStructureController.getModelAttributes]);

module.exports = router;
