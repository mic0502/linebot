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
                        "data": `date&${orderedMenu}`,
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
        };
    },
    // 時間を算出
    timeConversion: (date,time) => {
        const selectedTime = 9 + parseInt(time) - 9;
        return new Date(`${date} ${selectedTime}:00`).getTime();
    },
    // 所要時間計算
    calcTreatTime: (id,menu) => {
        return new Promise((resolve,reject)=>{
          console.log('その2');
          selectQuery = `SELETC * FROM TM_KOK WHERE line_id = '${id}';`
          User.dbQuery(selectQuery,'予約確認処理１')
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
    },
      
}
  
