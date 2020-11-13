const line = require('@line/bot-sdk');
const request = require('request-promise');
const config = {
    channelAccessToken:process.env.ACCESS_TOKEN,
    channelSecret:process.env.CHANNEL_SECRET
 };
const client = new line.Client(config);
const User = require('../models/User');

module.exports = {

    accountLink: (req,res) => {

        const line_uid = req.query.line_uid;

        // 登録済のユーザーかどうがチェック
        User.check('','',line_uid)
        .then(res=>{
            if (res > 0 ){
                // すでに登録済の場合
                console.log('登録済みアカウント');
                return client.replyMessage(ev.replyToken,{
                    "type":"text",
                    "text":"すでに連携済みです。"
                });
            }else{
                console.log('未登録アカウント');
                const options = {
                    url:`https://api.line.me/v2/bot/user/${line_uid}/linkToken`,
                    method:'POST',
                    headers:{'Authorization':'Bearer ahd1DH4XRUUjgL11hcQUMQxPXS4Xcr8UU1KOAzKIokK6LVe1I/ERSJ7fh8Epp8vLPrH+nB3oz52G0X3uBZpSvlxU74lkJJgY3oGQ4lc8ApLARAKN/7KOeIFNp1PdjXJ5XsNbxJLNDuQxB3YunWUJBQdB04t89/1O/w1cDnyilFU='},
                    followAllRedirects: false
                }
        
                request(options)
                    .then(body=>{
                        const parsedBody = JSON.parse(body);
                        res.status(200).send(parsedBody["linkToken"]);
                    });
        
            }
        })
    }
}