const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin');

router
   .route('/')
   .get(controller.getData);

router 
   .route('/costomer/:id')
   .post(controller.putUser);
   
module.exports = router;