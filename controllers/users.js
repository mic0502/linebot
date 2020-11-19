const User = require('../models/User');

module.exports = {

    postUser: (req,res) => {
        try{
            const {name,id,password} = req.body;

            // 新規登録の場合はランクはD、ポイントは０で登録
            const insert_query = {text:`INSERT INTO users (name,login_id,login_password,rank,point) VALUES('${name}','${id}','${password}','D','0');`};
            User.create(insert_query)
                .then(message=>{
                    console.log('message:',message);
                    // 環境変数のAPPパスへリダイレクト
                    res.status(200).redirect(process.env.APP_PATH); 
                })
                .catch(e=>console.log(e.stack));
         }catch(error){
             res.status(400).json({message:error.message});
         }
    },

    postLogin: (req,res) => {
    // ユーザーIDとパスワードでログイン
        try{
            console.log('req.body:',req.body);
            const {id,password,linkToken} = req.body;

            // IDとパスワードから検索
            User.check(id,password,'')
                .then(response=>{
                    if (response > 0 ){
                        console.log('認証成功');

                        // Nonceを追加
                        User.insertNonce(id,linkToken)
                            .then(resNonce=>{
                                res.status(200).send(resNonce);
                            })
                    }else{
                        console.log('ログイン失敗');
                    }
                })
                .catch(e=>console.log(e));

         }catch(error){
             res.status(400).json({message:error.message});
         }
    }
}