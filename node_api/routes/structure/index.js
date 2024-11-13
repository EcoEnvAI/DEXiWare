const express = require('express');
const router = express.Router();
const controller = require('../../controller/structure')

router.get('/inputs', [controller.getModelInputs]);
router.get('/inputs/model/:model', [controller.getModelInputs]);
router.get('/attributes', [controller.getModelAttributes]);
router.get('/attributes/model/:model', [controller.getModelAttributes]);


module.exports = router;
