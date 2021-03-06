const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin');

router
   .route('/')
   .get(controller.getkokData);

router
   .route('/updateCustomer/:login_id')
   .post(controller.updateCustomer);
   
router
   .route('/delCustomer/:login_id')
   .post(controller.delCustomer);
   
router
   .route('/menuChange/:menu_flg')
   .post(controller.menuChange);

router 
   .route('/selectReserve')
   .get(controller.getReserve);
   
router 
   .route('/updateReserve/:id')
   .post(controller.putReserve);
   
router 
   .route('/delReserve/:id')
   .post(controller.delReserve);

router 
   .route('/selectFair')
   .get(controller.getfairData);

module.exports = router;