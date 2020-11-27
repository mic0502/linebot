// 環境変数設定内容
// process.env.APP_PATH = 'https://linebot-linkapp.herokuapp.com/';
// process.env.ACCESS_TOKEN = 'ahd1DH4XRUUjgL11hcQUMQxPXS4Xcr8UU1KOAzKIokK6LVe1I/ERSJ7fh8Epp8vLPrH+nB3oz52G0X3uBZpSvlxU74lkJJgY3oGQ4lc8ApLARAKN/7KOeIFNp1PdjXJ5XsNbxJLNDuQxB3YunWUJBQdB04t89/1O/w1cDnyilFU=';
// process.env.CHANNEL_SECRET = '6ac0a53fabcf1bbb837d757420eebe1b';

// データベース情報の設定
// Postgresの設定
// $ heroku config:set PG_USER=puysjkyelweqtl --app linebot-linkapp
// $ heroku config:set PG_HOST=ec2-54-237-155-151.compute-1.amazonaws.com --app linebot-linkapp
// $ heroku config:set PG_DATABASE=d7spgkjbkj1nh3 --app linebot-linkapp
// $ heroku config:set PG_PASSWORD=f63d59e51a496356ecd870fd24d59fd53e6b9be616c01b6c11a8ba2e2952746d --app linebot-linkapp

const express = require('express');
const app = express();
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 5000
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
const richMenuId = 'richmenu-22d31397e83e56e01be48d40ccc30edd';

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
                    const login_id = checkRes.rows[0].login_id;
                    const update_query = {text:`UPDATE users SET line_id = '' WHERE login_id='${login_id}';`}
                    
                    User.release(update_query)
                    .then(response=>{
                        // リッチメニュー デフォルトに解除
                        client.unlinkRichMenuFromUser(ev.source.userId, richMenuId)

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
            "text":"メッセージありがとうございます。\n\n申し訳ございません。こちらから個別のご返信はできません。\n\nお問い合わせは下記からお願いします。\n\n■お問い合わせ\nhttps://jewelry-kajita.com/contact/"
        });
    }
 }

const accountLink = (ev) => {
    // 連携処理開始
    User.link(ev.link.nonce,ev.source.userId)
    .then(linkRes=>{
        // リッチメニュー 変更
        client.linkRichMenuToUser(ev.source.userId, richMenuId)

        return client.replyMessage(ev.replyToken,{
            "type":"text",
            "text":"連携完了！"
        });
    })
    .catch(e=>console.log(e));
}