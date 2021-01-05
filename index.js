const express = require('express');
const app = express();
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 5000
const path = require('path');
const router = require('./routers/index');
const usersRouter = require('./routers/users');
const linkRouter = require('./routers/link');
const multipart = require('connect-multiparty');
require('dotenv').config();
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
    console.log('ev中身:',ev);
    const profile = await client.getProfile(ev.source.userId);
    const text = (ev.message.type === 'text') ? ev.message.text : '';
    
    if(text === '予約する'){
        orderChoice(ev);
    }else{
        return client.replyMessage(ev.replyToken,{
            "type":"text",
            "text":"メッセージありがとうございます。\n\n申し訳ございません。こちらから個別のご返信はできません。\n\nお問い合わせは下記からお願いします。\n\n■お問い合わせ\nhttps://jewelry-kajita.com/contact/"
        });
    }
}

const accountLink = (ev) => {
    // リッチメニュー 変更
    client.linkRichMenuToUser(ev.source.userId, process.env.ENV_RICHMENUID)
    return client.replyMessage(ev.replyToken,{
        "type":"text",
        "text":"連携完了！"
    });
}

const orderChoice = (ev) => {
    return client.replyMessage(ev.replyToken,{
        "type":"flex",
        "altText":"menuSelect",
        "contents":
        {
            "type": "bubble",
            "header": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "メニューを選択して下さい",
                  "align": "center",
                  "size": "lg"
                }
              ]
            },
            "hero": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "(１つのみ選択可能です)",
                  "size": "md",
                  "align": "center"
                },
                {
                  "type": "separator"
                }
              ]
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "カット",
                        "data": "menu&0"
                      },
                      "style": "primary",
                      "color": "#999999",
                      "margin": "md"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "シャンプー",
                        "data": "menu&1"
                      },
                      "style": "primary",
                      "color": "#999999",
                      "margin": "md"
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "ｶﾗｰﾘﾝｸﾞ",
                        "data": "menu&2"
                      },
                      "margin": "md",
                      "style": "primary",
                      "color": "#999999"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "ヘッドスパ",
                        "data": "menu&3"
                      },
                      "margin": "md",
                      "style": "primary",
                      "color": "#999999"
                    }
                  ],
                  "margin": "md"
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "ﾏｯｻｰｼﾞ&ﾊﾟｯｸ",
                        "data": "menu&4"
                      },
                      "margin": "md",
                      "style": "primary",
                      "color": "#999999"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "顔そり",
                        "data": "menu&5"
                      },
                      "style": "primary",
                      "color": "#999999",
                      "margin": "md"
                    }
                  ],
                  "margin": "md"
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "眉整え",
                        "data": "menu&6"
                      },
                      "margin": "md",
                      "style": "primary",
                      "color": "#999999"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "選択終了",
                        "data": "end"
                      },
                      "margin": "md",
                      "style": "primary",
                      "color": "#0000ff"
                    }
                  ],
                  "margin": "md"
                },
                {
                  "type": "separator"
                }
              ]
            },
            "footer": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "キャンセル",
                    "data": "cancel"
                  }
                }
              ]
            }
          }
    });
 }