const express = require('express');
const app = express();
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 5000
const path = require('path');
const router = require('./routers/index');
const usersRouter = require('./routers/users');
const linkRouter = require('./routers/link');
const multipart = require('connect-multiparty');
const reserve = require('./controllers/reserve');
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
                const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
                (async () => {
                  await sleep(400);
                  promises.push(accountLink(ev));
                })();
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
        pushText = reserve.orderChoice();
    }else if(text === '予約確認'){
        pushText = await reserve.checkNextReservation(ev.source.userId,0);
    }else if(text === '予約キャンセル'){
        pushText = await reserve.checkNextReservation(ev.source.userId,1);
    }else{
        pushText = {"type":"text","text":"メッセージありがとうございます。\n\n申し訳ございません。こちらから個別のご返信はできません。\n\nお問い合わせは下記からお願いします。\n\n■お問い合わせ\nhttps://jewelry-kajita.com/contact/"};
    }
    return client.replyMessage(ev.replyToken,pushText);
}

const handlePostbackEvent = async (ev) => {
  const data = ev.postback.data;
  const splitData = data.split('&');
  let pushText;
  if((new Date().getTime() - splitData[0])>180000){
      pushText = {"type":"text","text":'一定時間経過しました。最初からやり直して下さい。'};
  }else if(splitData[1] === 'menu'){
      const orderedMenu = splitData[2];
      pushText = reserve.askDate(orderedMenu);
  }else if(splitData[1] === 'date'){
      const orderedMenu = splitData[2];
      const selectedDate = ev.postback.params.date;
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
    const startTimestamp = reserve.timeConversion(selectedDate,selectedTime);
    const insertData = await reserve.calcTreatTime(ev.source.userId,orderedMenu,selectedDate,startTimestamp);
    switch(insertData){
    case 401:
        pushText = {"type":"text","text":'ラインが連携されていません。'};break;
    default:
        pushText = {"type":"text","text":'予約が完了しました。'};
    }
  }else if(splitData[1] === 'cancel'){
        pushText = {"type":"text","text":'選択中止しました。'};
  }else if(splitData[1] === 'no'){
        pushText = {"type":"text","text":'予約を中止しました。'};
  }else if(splitData[0] === 'delete'){
    pushText = await reserve.deleteReserve(parseInt(splitData[2]));
  }
  return client.replyMessage(ev.replyToken,pushText);


  
}
