const request = require('request-promise');
const User = require('../models/User');

module.exports = {
    accountLink: (req,res) => {
        const line_uid = req.query.line_uid;       
        // ラインIDから登録済みかチェック
        const select_query = {text:`SELECT * FROM users WHERE line_id='${line_uid}';`};
        User.check(select_query)
        .then(checkRes=>{
            if (checkRes.rowCount > 0 ){
                // すでに連携済の場合
                console.log('登録済みアカウント');
                res.status(200).send(checkRes.rows[0]);
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
    },

    accountUnLink: (lineId) => {
        const select_query = {text:`SELECT * FROM users WHERE line_id='${lineId}';`}
        User.check(select_query)
        .then(checkRes=>{
            const name = checkRes.rows[0].name;
            const login_id = checkRes.rows[0].login_id;
            const password = checkRes.rows[0].login_password;
            const update_query = {text:`UPDATE users SET (name, login_id, login_password, line_id) = ('${name}', '${login_id}', '${password}', '') WHERE login_id='${login_id}';`}
            
            User.release(update_query)
            .then(releaseRes=>{
                console.log('アカウント解除成功');
                res.status(200).send(releaseRes);
            });

        })
    } 

}