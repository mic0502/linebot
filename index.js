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

const handlePostbackEvent = async (ev) => {
    const data = ev.postback.data;
    const splitData = data.split('&');
    
    if(splitData[0] === 'menu'){
        const orderedMenu = splitData[1];
        askDate(ev,orderedMenu);
    }else if(splitData[0] === 'date'){
        const orderedMenu = splitData[1];
        const selectedDate = ev.postback.params.date;
        askTime(ev,orderedMenu,selectedDate);
    }else if(splitData[0] === 'time'){
        const orderedMenu = splitData[1];
        const selectedDate = splitData[2];
        const selectedTime = splitData[3];
        confirmation(ev,orderedMenu,selectedDate,selectedTime); 
    }else if(splitData[0] === 'yes'){
        const orderedMenu = splitData[1];
        const selectedDate = splitData[2];
        const selectedTime = splitData[3];
        const startTimestamp = timeConversion(selectedDate,selectedTime);
        const treatTime = await calcTreatTime(ev.source.userId,orderedMenu);
        const endTimestamp = startTimestamp + treatTime*60*1000;
        const insertQuery = {
          text:'INSERT INTO reservations (line_uid, name, scheduledate, starttime, endtime, menu) VALUES($1,$2,$3,$4,$5,$6);',
          values:[ev.source.userId,profile.displayName,selectedDate,startTimestamp,endTimestamp,orderedMenu]
        };
        connection.query(insertQuery)
          .then(res=>{
            console.log('データ格納成功！');
            client.replyMessage(ev.replyToken,{
              "type":"text",
              "text":"予約が完了しました。"
            });
          })
          .catch(e=>console.log(e));
          
    }else if(splitData[0] === 'no'){
      // あとで何か入れる
    }
    
 }

 const calcTreatTime = (id,menu) => {
    return new Promise((resolve,reject)=>{
      console.log('その2');
      const selectQuery = {
        text: 'SELECT * FROM users WHERE line_uid = $1;',
        values: [`${id}`]
      };
      connection.query(selectQuery)
        .then(res=>{
          console.log('その3');
          const INITIAL_TREAT = [20,10,40,15,30,15,10];  //施術時間初期値（min）
          if(res.rows.length){
            const info = res.rows[0];
            const treatArray = [info.cuttime,info.shampootime,info.colortime,info.spatime,INITIAL_TREAT[4],INITIAL_TREAT[5],INITIAL_TREAT[6]];
            const menuNumber = parseInt(menu);
            const treatTime = treatArray[menuNumber];
            resolve(treatTime);
          }else{
            console.log('LINE　IDに一致するユーザーが見つかりません。');
            return;
          }
        })
        .catch(e=>console.log(e));
    });
   }

 const askDate = (ev,orderedMenu) => {
    return client.replyMessage(ev.replyToken,{
        "type":"flex",
        "altText":"予約日選択",
        "contents":
        {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "来店希望日を選んでください。",
                  "size": "md",
                  "align": "center"
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
                    "type": "datetimepicker",
                    "label": "希望日を選択する",
                    "data": `date&${orderedMenu}`,
                    "mode": "date"
                  }
                }
              ]
            }
          }
    });
 }

 const askTime = (ev,orderedMenu,selectedDate) => {
    return client.replyMessage(ev.replyToken,{
        "type":"flex",
        "altText":"予約日選択",
        "contents":
        {
            "type": "bubble",
            "header": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "ご希望の時間帯を選択してください（緑=予約可能です）",
                  "wrap": true,
                  "size": "lg"
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
                        "label": "9時-",
                        "data":`time&${orderedMenu}&${selectedDate}&0`
                      },
                      "style": "primary",
                      "color": "#00AA00",
                      "margin": "md"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "10時-",
                        "data": `time&${orderedMenu}&${selectedDate}&1`
                      },
                      "style": "primary",
                      "color": "#00AA00",
                      "margin": "md"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "11時-",
                        "data": `time&${orderedMenu}&${selectedDate}&2`
                      },
                      "style": "primary",
                      "color": "#00AA00",
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
                        "label": "12時-",
                        "data": `time&${orderedMenu}&${selectedDate}&3`
                      },
                      "style": "primary",
                      "color": "#00AA00",
                      "margin": "md"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "13時-",
                        "data": `time&${orderedMenu}&${selectedDate}&4`
                      },
                      "style": "primary",
                      "color": "#00AA00",
                      "margin": "md"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "14時-",
                        "data": `time&${orderedMenu}&${selectedDate}&5`
                      },
                      "style": "primary",
                      "color": "#00AA00",
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
                        "label": "15時-",
                        "data": `time&${orderedMenu}&${selectedDate}&6`
                      },
                      "style": "primary",
                      "color": "#00AA00",
                      "margin": "md"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "16時-",
                        "data": `time&${orderedMenu}&${selectedDate}&7`
                      },
                      "style": "primary",
                      "color": "#00AA00",
                      "margin": "md"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "17時-",
                        "data": `time&${orderedMenu}&${selectedDate}&8`
                      },
                      "style": "primary",
                      "color": "#00AA00",
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
                        "label": "18時-",
                        "data": `time&${orderedMenu}&${selectedDate}&9`
                      },
                      "style": "primary",
                      "color": "#00AA00",
                      "margin": "md"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "19時-",
                        "data": `time&${orderedMenu}&${selectedDate}&10`
                      },
                      "style": "primary",
                      "color": "#00AA00",
                      "margin": "md"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "終了",
                        "data": "end"
                      },
                      "style": "primary",
                      "color": "#0000ff",
                      "margin": "md"
                    }
                  ],
                  "margin": "md"
                }
              ]
            }
          }       
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
                  "text": "どちらか選択して下さい。",
                  "size": "lg",
                  "align": "center"
                }
              ]
            },
            "body": {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "景品A",
                    "data": "menu&0"
                  },
                  "margin": "md",
                  "style": "primary"
                },
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "景品B",
                    "data": "menu&1"
                  },
                  "margin": "md",
                  "style": "primary"
                }
              ],
              "position": "relative"
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


 const confirmation = (ev,menu,date,time) => {
    const splitDate = date.split('-');
    const selectedTime = 9 + parseInt(time);
    
    return client.replyMessage(ev.replyToken,{
      "type":"flex",
      "altText":"menuSelect",
      "contents":
      {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": `次回予約は${splitDate[1]}月${splitDate[2]}日 ${selectedTime}時〜でよろしいですか？`,
              "size": "lg",
              "wrap": true
            }
          ]
        },
        "footer": {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "postback",
                "label": "はい",
                "data": `yes&${menu}&${date}&${time}`
              }
            },
            {
              "type": "button",
              "action": {
                "type": "postback",
                "label": "いいえ",
                "data": `no&${menu}&${date}&${time}`
              }
            }
          ]
        }
      }
    });
   }