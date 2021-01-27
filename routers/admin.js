const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin');

router
   .route('/')
   .get(controller.getkokData);

router
   .route('/')
   .post(controller.updateCustomer);
   
router
   .route('/')
   .post(controller.delCustomer);
   
router 
   .route('/selectReserve')
   .get(controller.getReserve);
   
router 
   .route('/updateReserve/:id')
   .post(controller.putReserve);
   
router 
   .route('/delReserve/:id')
   .post(controller.delReserve);

module.exports = router;