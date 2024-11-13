const express = require('express');
const router = express.Router();
const controller = require('../controller/controller')

router.use('/api/assessment', require('./assessment'));
router.use('/api/structure', require('./structure'));
router.use('/api/analysis', require('./analysis'));

router.post('/api/getAllAssesments', [controller.getAllAssesments]);



module.exports = router;
