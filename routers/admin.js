const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin');

router
   .route('/')
   .get(controller.getkokData);

router 
   .route('/selectReserve')
   .post(controller.getData);
   
router 
   .route('/updateReserve/:id')
   .post(controller.putUser);
   
router 
   .route('/delReserve/:id')
   .post(controller.delUser);

module.exports = router;