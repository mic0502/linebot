const express = require('express');
const app = express();
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 5000
const { Client } = require('pg');
const path = require('path');
const router = require('./routers/index');
const usersRouter = require('./routers/users');
const linkRouter = require('./routers/link');
const User = require('./models/User');
const request = require('request-promise');
// const querystring = require('querystring');
const multipart = require('connect-multiparty');

const config = {
   channelAccessToken:process.env.ACCESS_TOKEN,
   channelSecret:process.env.CHANNEL_SECRET
};

// const create_userTable = {
// text:'CREATE TABLE IF NOT EXISTS users (id SERIAL NOT NULL, name VARCHAR(50), login_id VARCHAR(50), login_password VARCHAR(50), rank VARCHAR(50), point VARCHAR(50), line_id VARCHAR(255));'
// };
    
// connection.query(create_userTable)
// .then(()=>{
//     console.log('table users created successfully!!');
// })
// .catch(e=>console.log(e));

// const create_nonceTable = {
//     text:'CREATE TABLE IF NOT EXISTS nonces (id SERIAL NOT NULL, login_id VARCHAR(50), nonce VARCHAR(255));'
// }

// connection.query(create_nonceTable)
//     .then(()=>{
//         console.log('table nonce created successfully');
//     })
//     .catch(e=>console.log(e));

app
   .use(express.static(path.join(__dirname, 'public')))
   .use(multipart())
   .set('views', path.join(__dirname, 'views'))
   .set('view engine', 'ejs')
   .use('/',router)
   .post('/hook',line.middleware(config),(req,res)=> lineBot(req,res))
   .use(express.json())
   .use(express.urlencoded({extended:true}))
   .use('/api/users',usersRouter)
   .use('/api/link',linkRouter)
   .listen(PORT,()=>console.log(`Listening on ${PORT}`));

   const lineBot = (req,res) => {
    res.status(200).end();
    const events = req.body.events;
    const promises = [];
    for(let i=0;i<events.length;i++){
        const ev = events[i];
        console.log('ev:',ev);
        switch(ev.type){
            case 'follow':
                promises.push(greeting_follow(ev));
                break;
            
            case 'message':
                promises.push(handleMessageEvent(ev));
                break;

            case 'accountLink':
                promises.push(accountLink(ev));
                break;

            case 'postback':
                promises.push(handlePostbackEvent(ev));
                break;
        }
    }
    Promise
        .all(promises)
        .then(console.log('all promises passed'))
        .catch(e=>console.error(e.stack));
 }

 const greeting_follow = async (ev) => {
    const profile = await client.getProfile(ev.source.userId);
    return client.replyMessage(ev.replyToken,{
        "type":"text",
        "text":`${profile.displayName}さん、フォローありがとうございます\uDBC0\uDC04`
    });
 }


 const handleMessageEvent = async (ev) => {
    const profile = await client.getProfile(ev.source.userId);
    const text = (ev.message.type === 'text') ? ev.message.text : '';
    const lineId = ev.source.userId;

    if(text === '連携解除'){
        // ユーザーコントローラーを呼び出し連携を解除する
        User.release(lineId)
        .then(response=>{
            return client.replyMessage(ev.replyToken,{
                "type":"text",
                "text":"連携が解除されました！"
            });
        })

    }else{
        return client.replyMessage(ev.replyToken,{
            "type":"text",
            "text":`${profile.displayName}さん、今${text}って言いました？`
        });
    }
 }

const accountLink = (ev) => {
    const lineId = ev.source.userId;
    const nonce = ev.link.nonce;

    User.link(nonce,lineId)
    .then(response=>{
        return client.replyMessage(ev.replyToken,{
            "type":"text",
            "text":"連携完了！"
        });
    })

}