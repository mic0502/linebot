const User = require('../models/User');
const {randomBytes} = require('crypto')

module.exports = {

    postUser: (req,res) => {
        try{            
            const {name,id,password} = req.body;
            const select_query = `SELECT * FROM TM_KOK WHERE login_id='${id}';`
            User.dbQuery(select_query,'新規作成１番目')
            .then(checkRes=>{
                if (checkRes.length > 0 ){
                    if(checkRes[0].line_id != ''){
                        // すでに登録されたIDで他の端末で連携済みの場合
                        console.log('他の端末で連携済みのIDです。');
                        res.status(200).redirect(process.env.ENV_PATH + 'registration?error01');    //他の端末で連携済みのIDです。
                    }else{
                        // すでに登録されたIDで未連携場合
                        console.log('すでに登録されたIDでまだ連携されていないIDです。');
                        const update_query = `UPDATE TM_KOK SET name = '${name}', login_password = '${password}' WHERE login_id='${id}';`
                        User.dbQuery(update_query,'新規更新２番目')
                        .then(message=>{
                            console.log('message:',message);
                            // 環境変数のAPPパスへリダイレクト
                            res.status(200).redirect(`${process.env.ENV_PATH}?id=${id}&password=${password}`);
                        })
                        .catch(e=>console.log(e.stack));
                    }
                }else{
                    // 新規登録の場合はランクはD、ポイントは０で登録
                    const insert_query = `INSERT INTO TM_KOK (name,login_id,login_password,rank,point) VALUES('${name}','${id}','${password}','D','0');`
                    User.dbQuery(insert_query,'新規作成２番目')
                    .then(message=>{
                        console.log('message:',message);
                        // 環境変数のAPPパスへリダイレクト
                        res.status(200).redirect(`${process.env.ENV_PATH}?id=${id}&password=${password}`);
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
            const {id,password,line_uid,linkToken} = req.body;
            // IDとパスワードから検索
            const select_query = `SELECT * FROM TM_KOK WHERE login_id='${id}' and login_password='${password}';`
            User.dbQuery(select_query,'連携１番目')
                .then(checkRes=>{
                    if (checkRes.length > 0 ){
                        const line_id = checkRes[0].line_id;
                        if (!line_id){
                            // 空白かNullの場合は
                            console.log('認証成功');

                            // nonce生成d
                            const N=16
                            const randomStrings = randomBytes(N).reduce((p,i)=> p+(i%36).toString(36),'');
                            const buf = Buffer.from(randomStrings);
                            const nonce = buf.toString('base64');
    
                            // TM_KOKテーブルへの挿入
                            // Aランクは種別を2にする
                            let update_query;
                            if(checkRes[0].rank == 'A'){
                                update_query = `UPDATE TM_KOK SET sbt = '2', line_id = '${line_uid}', nonce = '${nonce}' WHERE login_id='${id}';`
                            }else{
                                update_query = `UPDATE TM_KOK SET sbt = '1', line_id = '${line_uid}', nonce = '${nonce}' WHERE login_id='${id}';`
                            }
                            User.dbQuery(update_query,'連携２番目')
                                .then(releaseRes=>{
                                    res.status(200).send(`accountLink?linkToken=${linkToken}&nonce=${nonce}`);
                                })

                        }else{
                            // すでに他の端末でログインすみ
                            console.log('他の端末でログインされています。');
                            res.status(402).send('他の端末でログインされています。');
                        }

                    }else{
                        console.log('ログイン失敗');
                        res.status(401).send('ログイン失敗');
                    }
                })
                .catch(e=>console.log(e));

         }catch(error){
             res.status(400).json({message:error.message});
         }
    },

    postConfirm: (req,res) => {
    // 変更内容の確認
        try{
            const {name,id,password} = req.body;
            const select_query = `UPDATE TM_KOK SET name = '${name}', login_password = '${password}' WHERE login_id='${id}';`
            User.dbQuery(select_query,'変更１番目')
                .then(checkRes=>{
                    res.status(200).redirect(process.env.ENV_PATH);
                })
                .catch(e=>console.log(e));    

         }catch(error){
             res.status(400).json({message:error.message});
         }
    },

    postSvQuery: (req,res) => {
        var fs = require('fs');             // File System(Node API)：ファイル操作
        var readline = require("readline");
        var files = [];
        files = fs.readdirSync('./sql');    // フォルダ内のファイルを配列にいれる

        if(files.length>0){
        // for (let i = 0; i < files.length; i++) {
            var stream = fs.createReadStream(`./sql/${files[0]}`, 'utf8');
            var reader = readline.createInterface({ input: stream });
            var texts = [];
            reader.on("line", (data) => {
                texts.push(data.replace(/\r?\n/g,""));
            });
            reader.on('close', function () {
                var svQuery = `SELECT * FROM TM_KOK WHERE login_id ='${texts[1]}';`;
                User.dbQuery(svQuery,'サーバー更新処理')
                .then(results=>{
                    // 登録済みの顧客かチェックしてSQL文生成
                    if(results.length > 0){
                        svQuery = `UPDATE TM_KOK SET sys_name = '${texts[2]}', rank = '${texts[3]}', point = ${texts[4]}, birthday = '${texts[5]}', recent_buy = '${texts[6]}', tts = '${texts[7]}' WHERE login_id='${texts[1]}';`;
                    }else{
                        svQuery = `INSERT INTO TM_KOK (login_id,sys_name,name,rank,point,birthday,recent_buy,tts,login_password) VALUES('${texts[1]}','${texts[2]}','${texts[2]}','${texts[3]}',${texts[4]},'${texts[5]}','${texts[6]}','${texts[7]}','${texts[5]}');`
                    }
                    User.dbQuery(svQuery,'サーバー更新処理２')
                })
            });
            fs.unlinkSync(`./sql/${files[0]}`);     //ファイルを削除
        };
    }
        
}