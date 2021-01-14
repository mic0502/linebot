const express = require('express');
const router = express.Router();
const controller = require('../controllers/api');

router
   .route('/')
   .get(controller.getData);

router 
   .route('/updateCustomer/:id')
   .post(controller.putUser);
   
module.exports = router;