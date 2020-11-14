const request = require('request-promise');
const User = require('../models/User');
// const chanelAccessToken = 'ahd1DH4XRUUjgL11hcQUMQxPXS4Xcr8UU1KOAzKIokK6LVe1I/ERSJ7fh8Epp8vLPrH+nB3oz52G0X3uBZpSvlxU74lkJJgY3oGQ4lc8ApLARAKN/7KOeIFNp1PdjXJ5XsNbxJLNDuQxB3YunWUJBQdB04t89/1O/w1cDnyilFU='

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