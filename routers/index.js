const express = require('express');
const router = express.Router();

router 
    .get('/',(req,res)=>{
        res.render('pages/index');
    })
    .get('/insert',(req,res)=>{
        res.render('pages/insert');
    })
    .get('/select',(req,res)=>{
        res.render('pages/select');
    })
    .get('/list-item',(req,res)=>{
        res.render('pages/list-item');
    })
    .get('/item',(req,res)=>{
        res.render('pages/item');
    })
    .get('/print',(req,res)=>{
        res.render('pages/print');
    })
    .get('/pointAdd',(req,res)=>{
        res.render('pages/pointAdd');
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
    .get('/customer',(req,res)=>{
        res.render('pages/customer');
    })
    .get('/reservations',(req,res)=>{
        res.render('pages/reservations');
    })
    .get('/fair',(req,res)=>{
        res.render('pages/fair');
    })

module.exports = router;