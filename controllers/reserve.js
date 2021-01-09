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
                        "data": `${new Date().getTime()}&menu&0`
                      },
                      "margin": "md",
                      "style": "primary"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "景品B",
                        "data": `${new Date().getTime()}&menu&1`
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
                            "label": "9時-",
                            "data":`${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&0`
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
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&1`
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
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&2`
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
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&3`
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
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&4`
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
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&5`
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
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&6`
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
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&7`
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
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&8`
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
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&9`
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
                            "data": `${new Date().getTime()}&time&${orderedMenu}&${selectedDate}&10`
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
        const splitDate = date.split('-');
        const selectedTime = 9 + parseInt(time);
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
    // 時間を算出
    timeConversion: (date,time) => {
        const selectedTime = 9 + parseInt(time) - 9;
        return new Date(`${date} ${selectedTime}:00`).getTime();
    },
    // 所要時間計算
    calcTreatTime: (id,menu,selectedDate,startTime) => {
        return new Promise((resolve,reject)=>{
          const selectQuery = `SELECT * FROM TM_KOK WHERE line_id ='${id}';`;
          User.dbQuery(selectQuery,'予約確認処理１')
            .then(res=>{
              const INITIAL_TREAT = [20,10,40,15,30,15,10];  //施術時間初期値（min）
              if(res.length){
                const info = res[0];
                const treatArray = [INITIAL_TREAT[0],INITIAL_TREAT[1],INITIAL_TREAT[2],INITIAL_TREAT[3],INITIAL_TREAT[4],INITIAL_TREAT[5],INITIAL_TREAT[6]];
                const menuNumber = parseInt(menu);
                const treatTime = treatArray[menuNumber];
                const endTime = startTime + treatTime*60*1000;
                const insertQuery = `INSERT INTO reservations (line_uid, name, scheduledate, starttime, endtime, menu) VALUES('${id}','${res[0].name}','${selectedDate}','${startTime}','${endTime}','${menu}');`;
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
        const selectQuery = `SELECT * FROM reservations WHERE line_uid ='${id}' ORDER BY scheduledate desc, starttime desc;`;
        User.dbQuery(selectQuery,'予約確認処理１')
          .then(res=>{
            if(res.length){
              const MENU = ['景品A','景品B'];
              const startTimestamp = res[0].starttime;
              const date = dateConversion(startTimestamp);
              const menu = MENU[parseInt(res[0].menu)];
              if(flg===0){
                resolve({"type":"text","text": `次回予約は${date}、${menu}でお取りしてます\uDBC0\uDC22`});  //確認
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
                          "text": `次回の予約は${date}から、${menu}でおとりしてます。この予約をキャンセルしますか？`,
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
                            "data": `${new Date().getTime()}&delete&${res[0].id}`
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
        const deleteQuery = `DELETE FROM reservations WHERE id = ${id};`;
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

const dateConversion = (timestamp) => {
  const WEEK = [ "日", "月", "火", "水", "木", "金", "土" ];
  const d = new Date(parseInt(timestamp));
  const month = d.getMonth()+1;
  const date = d.getDate();
  const day = d.getDay();
  const hour = ('0' + (d.getHours()+9)).slice(-2);
  const min = ('0' + d.getMinutes()).slice(-2);
  return `${month}月${date}日(${WEEK[day]}) ${hour}:${min}`;
}
