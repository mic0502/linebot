const express = require('express');
const router = express.Router();
const controller = require('../controllers/shn');

router
    .route('/insert')
    .post(controller.insertShn);

router
    .route('/search')
    .post(controller.searchShn);

router
    .route('/update')
    .post(controller.updateShn);


module.exports = router;