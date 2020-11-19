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
// const request = require('request-promise');
// const querystring = require('querystring');
const multipart = require('connect-multiparty');

const config = {
   channelAccessToken:process.env.ACCESS_TOKEN,
   channelSecret:process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

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
        const select_query = {text:`SELECT * FROM users WHERE line_id='${lineId}';`}
        User.check(select_query)
            .then(checkRes=>{
                if(checkRes.rowCount > 0){
                    const name = checkRes.rows[0].name;
                    const login_id = checkRes.rows[0].login_id;
                    const password = checkRes.rows[0].login_password;
                    const update_query = {text:`UPDATE users SET (name, login_id, login_password, line_id) = ('${name}', '${login_id}', '${password}', '') WHERE login_id='${login_id}';`}
                    
                    User.release(update_query)
                    .then(response=>{
                        return client.replyMessage(ev.replyToken,{
                            "type":"text",
                            "text":"連携が解除されました！"
                        });
                    })        
                }else{
                    // 未連携の場合
                    return client.replyMessage(ev.replyToken,{
                        "type":"text",
                        "text":`${profile.displayName}さん、「${text}」って言いました？`
                    });
                }
            })

    }else{
        // 上記以外のメッセージ受診の場合はおうむ返しする
        return client.replyMessage(ev.replyToken,{
            "type":"text",
            "text":`${profile.displayName}さん、「${text}」って言いました？`
        });
    }
 }

const accountLink = (ev) => {
    // 連携処理開始
    User.link(ev.link.nonce,ev.source.userId)
    .then(linkRes=>{
        return client.replyMessage(ev.replyToken,{
            "type":"text",
            "text":"連携完了！"
        });
    })
    .catch(e=>console.log(e));

}