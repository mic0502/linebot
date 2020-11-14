const request = require('request-promise');
const User = require('../models/User');

module.exports = {
    accountLink: (req,res) => {
        const line_uid = req.query.line_uid;        
        User.check('','',line_uid)
        .then(res2=>{
            if (res2 > 0 ){
                // すでに連携済の場合
                console.log('登録済みアカウント');
                User.getKokData(line_uid)
                .then(resProfile=>{
                    res.status(200).send(resProfile);
                })
            }else{
                // まだ連携されていない場合リンクトークンを取得
                // 環境変数のチャネルアクセストークンをヘッダーに設定
                console.log('未登録アカウント');
                const options = {
                    url:`https://api.line.me/v2/bot/user/${line_uid}/linkToken`,
                    method:'POST',
                    headers:{'Authorization':`Bearer ${process.env.ACCESS_TOKEN}`},
                    followAllRedirects: false
                }
                request(options)
                    .then(body=>{
                        res.status(200).send(body);
                    });
            }
        })
    }
}