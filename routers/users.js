const express = require('express');
const router = express.Router();
const controller = require('../controllers/users');

router
    .route('/')
    .post(controller.postUser);

router
    .route('/login')
    .post(controller.postLogin);

router
    .route('/confirm')
    .post(controller.postConfirm);

router
    .route('/svquery')
    .post(controller.postSvQuery);
    
module.exports = router;