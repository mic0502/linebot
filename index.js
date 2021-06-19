const express = require('express');
const app = express();
const line = require('@line/bot-sdk');
const path = require('path');
const router = require('./routers/index');
const usersRouter = require('./routers/users');
const shnRouter = require('./routers/shn');
const apiRouter = require('./routers/admin');
const multipart = require('connect-multiparty');
const reserve = require('./controllers/reserve');
const users = require('./controllers/users');
const shn = require('./controllers/shn');
require('dotenv').config();
const PORT = process.env.PORT
const config = {
   channelAccessToken:process.env.ENV_CHANNEL_ACCESS_TOKEN,
   channelSecret:process.env.ENV_CHANNEL_SECRET
};
const client = new line.Client(config);
let photoMessageId;

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
   .use('/api/shn',shnRouter)
   .use('/api/admin',apiRouter)
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
                const msg = ev.message.text;
                if(ev.message.type=='image'){
                    promises.push(handlePostbackShn(ev));   //商品入庫処理
                    break;
                }else if(msg.indexOf("商品No：'") === 0){
                    return client.replyMessage(ev.replyToken,{"type":"text","text":"入庫完了！！"});
                };
                promises.push(handleMessageEvent(ev));
                break;
            case 'accountLink':
                promises.push(accountLink(ev));
                break;
            case 'postback':
                const splitData = ev.postback.data.split('&');
                if((new Date().getTime() - splitData[0])>60000){
                    return client.replyMessage(ev.replyToken,{"type":"text","text":'一定時間経過しました。最初からやり直して下さい。'});
                }else if(splitData[1] === 'shn'){
                    promises.push(handlePostbackShn(ev));   //商品入庫処理
                }else{
                    promises.push(handlePostbackEvent(ev)); //イベント予約
                };
        }
    }
    Promise
        .all(promises)
        .then(console.log('全ての処理完了！'))
        .catch(e=>console.error('プロミスエラー' + e.stack));
}

const greeting_follow = async (ev) => {
    const profile = await client.getProfile(ev.source.userId);
    return client.replyMessage(ev.replyToken,{
        "type":"text",
        "text":`${profile.displayName}さん、フォローありがとうございます\uDBC0\uDC04`
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
  
const handleMessageEvent = async (ev) => {
    const text = (ev.message.type === 'text') ? ev.message.text : '';
    let pushText;
    if(text === '予約する'){
        pushText = await reserve.orderChoice(ev.source.userId);
    }else if(text === '予約確認'){
        pushText = await reserve.checkNextReservation(ev.source.userId,0);
    }else if(text === '予約キャンセル'){
        pushText = await reserve.checkNextReservation(ev.source.userId,1);
    }else if(text === '連携解除'){
        pushText = await users.confirmation();
    }else{
        pushText = {"type":"text","text":"メッセージありがとうございます。\n\n申し訳ございません。こちらから個別のご返信はできません。\n\nお問い合わせは下記からお願いします。\n\n■お問い合わせ\nhttps://jewelry-kajita.com/contact/"};
    }
    return client.replyMessage(ev.replyToken,pushText);
}

const handlePostbackEvent = async (ev) => {
  const splitData = ev.postback.data.split('&');
  let pushText;
  if(splitData[1] === 'menu'){
      const orderedMenu = splitData[2];
      pushText = reserve.askDate(orderedMenu);
  }else if(splitData[1] === 'date'){
      const orderedMenu = splitData[2];
      const selectedDate = ev.postback.params.date.replace(/-/g,'/');
      pushText = reserve.askTime(orderedMenu,selectedDate);
  }else if(splitData[1] === 'time'){
      const orderedMenu = splitData[2];
      const selectedDate = splitData[3];
      const selectedTime = splitData[4];
      pushText = reserve.confirmation(orderedMenu,selectedDate,selectedTime);
  }else if(splitData[1] === 'yes'){
    const orderedMenu = splitData[2];
    const selectedDate = splitData[3];
    const selectedTime = splitData[4];
    const insertData = await reserve.insertReservation(ev.source.userId,orderedMenu,selectedDate,selectedTime);
    switch(insertData){
        case 401:
            pushText = {"type":"text","text":'ラインが連携されていません。'};break;
        default:
            pushText = {"type":"text","text":'予約が完了しました。'};
    }
  }else if(splitData[1] === 'end'){
    pushText = {"type":"text","text":'予約を中止しました。'};
  }else if(splitData[1] === 'delete'){
    pushText = await reserve.deleteReserve(parseInt(splitData[2]));
  }else if(splitData[1] === 'unlinkyes'){
    pushText = await users.releaseLink(ev.source.userId);
  }else if(splitData[1] === 'unlinkno'){
    pushText = {"type":"text","text":'ライン連携解除を中止しました。'};
  }
  return client.replyMessage(ev.replyToken,pushText); 
}

const handlePostbackShn = async (ev) => {
    let pushText;
    if(ev.type=='message'){
        await shn.downloadData();           //商品の素材形状をダウンロード
        pushText = await shn.selectMetal(ev.source.userId);
        photoMessageId = ev.message.id;
    }else{
        const splitData = ev.postback.data.split('&');
        if(splitData[2] === 'metal'){
            pushText = shn.selectStone(splitData[3]);
        }else if(splitData[2] === 'stone'){
            pushText = shn.selectType(splitData[3],splitData[4],photoMessageId);
            shn.savePhoto(photoMessageId);       //画像が送られてきた場合
        }
    }
    return client.replyMessage(ev.replyToken,pushText);    
}
  