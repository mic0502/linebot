const User = require('../models/User');

module.exports = {

    postUser: (req,res) => {
        try{
            const {name,id,password} = req.body;
            console.log('name id pass',name,id,password);
            User.create({name,id,password})
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