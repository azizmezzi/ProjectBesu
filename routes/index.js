var express = require('express');
var router = express.Router();
const ControllerMethods = require('../controller/tontine');

router.get('/getParticipant', ControllerMethods.getParticipant);
router.get('/getTontine', ControllerMethods.getTontine);


router.post('/createTontine', ControllerMethods.createTontine);
router.post('/addParticipant', ControllerMethods.addParticipant);

module.exports = router;