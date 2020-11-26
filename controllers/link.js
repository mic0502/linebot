const request = require('request-promise');
const User = require('../models/User');

module.exports = {
    accountLink: (req,res) => {
        const line_uid = req.query.line_uid;       
        // ラインIDから登録済みかチェック
        const select_query = `SELECT * FROM users WHERE line_id='${line_uid}';`
        User.check(select_query)
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