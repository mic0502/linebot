const express = require('express');

const router = express.Router();

router 
    .get('/',(req,res)=>{
        res.render('pages/index');
    })
    .get('/registration',(req,res)=>{
        res.render('pages/registration');
    })
    .get('/mainpage',(req,res)=>{
        res.render('pages/mainpage');
    })
    .get('/update',(req,res)=>{
        res.render('pages/update');
    })
    .get('/admin',(req,res)=>{
        res.render('pages/admin');
    })
    .get('/users',(req,res)=>{
        res.render('pages/users');
    })
    .get('/reservations',(req,res)=>{
        res.render('pages/reservations');
    });

module.exports = router;