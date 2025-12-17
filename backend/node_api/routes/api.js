const express = require('express');
const router = express.Router();
const controller = require('../controller/controller')

router.use('/api/assessment', require('./assessment'));
router.use('/api/structure', require('./structure'));
// router.use('/api/analysis', require('./analysis'));

/**
 * @openapi
 * /api/getAllAssessments:
 *   post:
 *     summary: Get all assessments
 *     tags:
 *       - Assessment
 */
router.post('/api/getAllAssessments', [controller.getAllAssessments]);



module.exports = router;
