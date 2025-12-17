const express = require('express');
const router = express.Router();
const controller = require('../../controller/analysis')

/*TODO: middleware to validate input (req.body) to each request*/
/*NOT IN USE FOR TomRes Application*/

// router.post('/bottom-up', [controller.bottomUpAnalysis]);
// router.post('/bottom-up/model/:model', [controller.bottomUpAnalysis]);
// router.post('/bottom-up/root', [controller.bottomUpAnalysisRoot]);
// router.post('/bottom-up/model/:model/root', [controller.bottomUpAnalysisRoot]);
// router.post('/top-down', [controller.topDownAnalysis]);
// router.post('/top-down/model/:model', [controller.topDownAnalysis]);

module.exports = router;
