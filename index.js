const express = require('express');
const app = express();
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 5000
const path = require('path');
const router = require('./routers/index');
const usersRouter = require('./routers/users');
const linkRouter = require('./routers/link');
const multipart = require('connect-multiparty');
if(process.env.ENV_PATH.indexOf('heroku')==0){
    require('dotenv').config();  //本番
}
const config = {
   channelAccessToken:process.env.ENV_CHANNEL_ACCESS_TOKEN,
   channelSecret:process.env.ENV_CHANNEL_SECRET
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
    // 上記以外のメッセージ受診の場合はおうむ返しする
    return client.replyMessage(ev.replyToken,{
        "type":"text",
        "text":"メッセージありがとうございます。\n\n申し訳ございません。こちらから個別のご返信はできません。\n\nお問い合わせは下記からお願いします。\n\n■お問い合わせ\nhttps://jewelry-kajita.com/contact/"
    });
}

const accountLink = (ev) => {
    // リッチメニュー 変更
    client.linkRichMenuToUser(ev.source.userId, process.env.ENV_RICHMENUID)
    return client.replyMessage(ev.replyToken,{
        "type":"text",
        "text":"連携完了！"
    });
}
