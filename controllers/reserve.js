const request = require('request-promise');
const User = require('../models/User');
const line = require('@line/bot-sdk');

module.exports = {
    // メニュー選択
    orderChoice: () => {
        return {
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
                        "data": `${new Date().getTime()}&menu&景品A`
                      },
                      "margin": "md",
                      "style": "primary"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "景品B",
                        "data": `${new Date().getTime()}&menu&景品B`
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
                        "data": `${new Date().getTime()}&cancel`
                      }
                    }
                  ]
                }
              }
        };
    },
    // 日付選択
    askDate: (orderedMenu) => {
        return {
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
                        "data": `${new Date().getTime()}&date&${orderedMenu}`,
                        "mode": "date"
                        }
                    }
                    ]
                }
            }
        }
    },
    // 時間選択
    askTime: (orderedMenu,selectedDate) => {
        return {
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
                            "label": "10時-",
                            "data":`${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&10:00`
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
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&11:00`
                          },
                          "style": "primary",
                          "color": "#00AA00",
                          "margin": "md"
                        },
                        {
                          "type": "button",
                          "action": {
                            "type": "postback",
                            "label": "12時-",
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&12:00`
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
                            "label": "13時-",
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&13:00`
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
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&14:00`
                          },
                          "style": "primary",
                          "color": "#00AA00",
                          "margin": "md"
                        },
                        {
                          "type": "button",
                          "action": {
                            "type": "postback",
                            "label": "15時-",
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&15:00`
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
                            "label": "16時-",
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&16:00`
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
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&17:00`
                          },
                          "style": "primary",
                          "color": "#00AA00",
                          "margin": "md"
                        },
                        {
                          "type": "button",
                          "action": {
                            "type": "postback",
                            "label": "18時-",
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&18:00`
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
                            "label": "19時-",
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&19:00`
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
                            "data": `${new Date().getTime()}&end`
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
        };
     },        
    // 確認メッセージ
    confirmation: (menu,date,time) => {
        const splitDate = date.split('/');
        return {
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
                  "text": `次回予約は${splitDate[1]}月${splitDate[2]}日 ${time}時〜でよろしいですか？`,
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
                    "data": `${new Date().getTime()}&yes&${menu}&${date}&${time}`
                  }
                },
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "いいえ",
                    "data": `${new Date().getTime()}&no&${menu}&${date}&${time}`
                  }
                }
              ]
            }
          }
        };
    },
    // 所要時間計算
    insertReservation: (id,menu,selectedDate,selectedtime) => {
        return new Promise((resolve,reject)=>{
          const selectQuery = `SELECT * FROM TM_KOK WHERE line_id ='${id}';`;
          User.dbQuery(selectQuery,'予約確認処理１')
            .then(res=>{
              if(res.length){
                const convertJST = new Date();
                convertJST.setHours(convertJST.getHours() + 9);
                const recieveDate = convertJST.toLocaleString('ja-JP').slice(0,-3);
                const insertQuery = `INSERT INTO TM_RESERVE (line_uid, name, recievedate, selecteddate, selectedtime, menu) VALUES('${id}','${res[0].name}','${recieveDate}','${selectedDate}','${selectedtime}','${menu}');`;
                User.dbQuery(insertQuery,'予約データ格納１')
                  .then(insRes=>{
                    resolve(200);
                  })
                  .catch(e=>console.log(e));
              }else{
                console.log('LINE　IDに一致するユーザーが見つかりません。');
                reject(401);
              }
            })
            .catch(e=>console.log(e));
        });
    },
    // 予約確認
    checkNextReservation: (id,flg) => {
      return new Promise((resolve,reject)=>{
        const nowTime = new Date().getTime();
        const selectQuery = `SELECT * FROM TM_RESERVE WHERE line_uid ='${id}' ORDER BY id desc;`;
        User.dbQuery(selectQuery,'予約確認処理１')
          .then(res=>{
            if(res.length){
              var weekday = [ "日", "月", "火", "水", "木", "金", "土" ] ;
              const date = res[0].selecteddate;
              console.log(`テスト${date}`);
              const week = weekday[ res[0].selecteddate.getDay() ] ;            
              const time = res[0].selectedtime;
              const menu = res[0].menu;
              if(flg===0){
                resolve({"type":"text","text": `次回予約は${date}月${time}日${week}曜日、${menu}でお取りしてます\uDBC0\uDC22`});  //確認
              }else{
                resolve({
                  "type":"flex",
                  "altText": "cancel message",
                  "contents":
                  {
                    "type": "bubble",
                    "body": {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "text",
                          "text": `次回の予約は$${date}月${time}日${week}曜日、${menu}でおとりしてます。この予約をキャンセルしますか？`,
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
                            "label": "予約をキャンセルする",
                            "data": `delete&${res[0].id}`
                          }
                        }
                      ]
                    }
                  }
                });  //削除
              }
            }else{
              reject({"type":"text","text": '予約が入っておりません。'});
            }
          })
          .catch(e=>console.log(e));
      });
    },
    // 予約削除
    deleteReserve: (id) => {
      return new Promise((resolve,reject)=>{
        const deleteQuery = `DELETE FROM TM_RESERVE WHERE id = ${id};`;
        User.dbQuery(deleteQuery,'削除処理１')
        .then(res=>{
          console.log('予約キャンセル成功');
          resolve({
            "type":"text",
            "text":"予約をキャンセルしました。"
          });
        })
        .catch(e=>console.log(e));
      });
    },

}
