const request = require('request-promise');
const User = require('../models/User');
const line = require('@line/bot-sdk');
const users = require('./users');
const client = new line.Client({channelAccessToken: process.env.ENV_CHANNEL_ACCESS_TOKEN});

module.exports = {
    accountLink: (req,res) => {
        if(process.env.ENV_PATH.indexOf('kajita')>0){
            // 本番環境の場合、非同期でサーバー更新処理
            users.postSvQuery();
        }

        const line_uid = req.query.line_uid;       
        // ラインIDから登録済みかチェック
        const select_query = `SELECT * FROM TM_KOK WHERE line_id='${line_uid}';`
        User.dbQuery(select_query,'最初のチェック')
        .then(checkRes=>{
            if (checkRes.length > 0 ){
                    // すでに連携済の場合
                console.log('登録済みアカウント');
                res.status(200).send(checkRes[0]);
            }else{
                // まだ連携されていない場合リンクトークンを取得
                console.log('未登録アカウント');
                const options = {
                    url:`https://api.line.me/v2/bot/user/${line_uid}/linkToken`,
                    method:'POST',
                    headers:{Authorization:`Bearer '${process.env.ENV_CHANNEL_ACCESS_TOKEN}'`},
                    followAllRedirects: false
                }
                request(options)
                    .then(body=>{
                        res.status(200).send(body);
                    });
            }
        })
    },

    releaseLink: (req,res) => {
        const line_uid = req.query.line_uid;       

        // 連携解除処理開始
        const update_query = `UPDATE TM_KOK SET line_id = '', nonce = '' WHERE line_id='${line_uid}';`
        User.dbQuery(update_query,'連携解除')
        .then(releaseRes=>{
            // リッチメニュー デフォルトに解除
            client.unlinkRichMenuFromUser(line_uid, process.env.ENV_RICHMENUID)
            const message = {
                "type":"text",
                "text":"連携が解除されました！"
            };
            client.pushMessage(line_uid, message)
            res.status(200).send('連携が解除されました。');
        })
        .catch(e=>console.log(e));    

    }
    
}