const express = require('express');
const router = express.Router();
const controller = require('../../controller/assessment')

router.post('/evaluate', [controller.evaluate]);
router.post('/evaluate/model/:model', [controller.evaluate]);
router.post('/evaluate/root', [controller.evaluateRoot]);
router.post('/evaluate/model/:model/root', [controller.evaluateRoot]);


module.exports = router;
