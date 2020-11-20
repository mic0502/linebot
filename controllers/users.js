const User = require('../models/User');
const {randomBytes} = require('crypto')

module.exports = {

    postUser: (req,res) => {
        try{
            const {name,id,password} = req.body;
            const select_query = {text:`SELECT * FROM users WHERE login_id='${id}';`};
            User.check(select_query)
            .then(checkRes=>{
                if (checkRes.rowCount > 0 ){
                    // すでに登録されたIDの場合
                    console.log('すでに使用されたIDです。');
                    res.status(200).redirect(process.env.APP_PATH + 'registration?error01'); 
                }else{
                    // 新規登録の場合はランクはD、ポイントは０で登録
                    const insert_query = {text:`INSERT INTO users (name,login_id,login_password,rank,point) VALUES('${name}','${id}','${password}','D','0');`};
                    User.create(insert_query)
                    .then(message=>{
                        console.log('message:',message);
                        // 環境変数のAPPパスへリダイレクト
                        res.status(200).redirect(process.env.APP_PATH); 
                    })
                    .catch(e=>console.log(e.stack));
                }
            })
         }catch(error){
             res.status(400).json({message:error.message});
         }
    },

    postLogin: (req,res) => {
    // ユーザーIDとパスワードでログイン
        try{
            const {id,password,linkToken} = req.body;
            // IDとパスワードから検索
            const select_query = {text:`SELECT * FROM users WHERE login_id='${id}' and login_password='${password}';`};
            User.check(select_query)
                .then(checkRes=>{
                    if (checkRes.rowCount > 0 ){
                        console.log('認証成功');

                        // nonce生成d
                        const N=16
                        const randomStrings = randomBytes(N).reduce((p,i)=> p+(i%36).toString(36),'');
                        const buf = Buffer.from(randomStrings);
                        const nonce = buf.toString('base64');

                        // nonceテーブルへの挿入
                        const insert_query = {text:`INSERT INTO nonces (login_id,nonce) VALUES('${id}','${nonce}');`}
                        User.insertNonce(insert_query,linkToken,nonce)
                            .then(insertNonceRes=>{
                                res.status(200).send(insertNonceRes);
                            })
                    }else{
                        console.log('ログイン失敗');
                        res.status(401).json({message:'ログイン失敗'});
                    }
                })
                .catch(e=>console.log(e));

         }catch(error){
             res.status(400).json({message:error.message});
         }
    }
}