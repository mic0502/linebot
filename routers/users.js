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
    .route('/link')
    .get(controller.accountLink);
    
router
    .route('/accountCheck')
    .get(controller.accountCheck);

router
    .route('/select')
    .get(controller.selectKok);

router
    .route('/pointAdd')
    .post(controller.pointAdd);

router
    .route('/release')
    .get(controller.releaseLink);

    
module.exports = router;