const User = require('../models/User');
const {randomBytes} = require('crypto')
const request = require('request-promise');
const line = require('@line/bot-sdk');
const client = new line.Client({channelAccessToken: process.env.ENV_CHANNEL_ACCESS_TOKEN});

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
        
    accountLink: (req,res) => {
        if(process.env.ENV_PATH.indexOf('kajita')>0){
            // 本番環境の場合、非同期でサーバー更新処理
            postSvQuery();
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

        function postSvQuery() {
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


    },

    accountCheck: (req,res) =>{
        const lineId = req.query.lineId;   
        const selectQuery = `SELECT * FROM TM_KOK WHERE line_id = '${lineId}'`;
        User.dbQuery(selectQuery,'権限チェック')
          .then(kokRes=>{
            res.status(200).send(kokRes[0].sbt);
          })
          .catch(e=>console.log(e))

    },

    selectKok: (req,res) => {

        const loginId = req.query.loginId;   
        // ラインIDから登録済みかチェック
        const select_query = `SELECT * FROM TM_KOK WHERE login_id='${loginId}';`
        User.dbQuery(select_query,'最初のチェック')
        .then(kokRes=>{
            res.status(200).json(kokRes);
        })
        .catch(e=>console.log(e))           
    },

    pointAdd: (req,res) => {
        try{
            const {loginId,totalPoint} = req.body;
            // ラインIDから登録済みかチェック
            const update_query = `UPDATE TM_KOK SET point = ${totalPoint} WHERE login_id='${loginId}';`
            User.dbQuery(update_query,'顧客テーブルのポイント更新')
            .then(kokRes=>{
                res.status(200).send('ポイント更新成功');
            })
            .catch(e=>console.log(e))           
        }catch(error){
            res.status(400).send('ポイント更新失敗');
        }
    },

    confirmation: () => {
        return {
          "type":"flex",
          "altText":"選択してください。",
          "contents":
          {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": '連携を解除してよろしいですか？',
                  "size": "lg",
                  "wrap": true
                }
              ]
            },
            "footer": {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "はい",
                    "data": `${new Date().getTime()}&unlinkyes`
                  }
                },
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "いいえ",
                    "data": `${new Date().getTime()}&unlinkno`
                  }
                }
              ]
            }
          }
        };
    },

    releaseLink: (line_uid) => {
        return new Promise((resolve,reject)=>{
        // 連携解除処理開始
        const update_query = `UPDATE TM_KOK SET sbt = '', line_id = '', nonce = '' WHERE line_id='${line_uid}';`
        User.dbQuery(update_query,'連携解除')
          .then(res=>{
            // リッチメニュー デフォルトに解除
            client.unlinkRichMenuFromUser(line_uid, process.env.ENV_RICHMENUID)
            resolve({"type":"text","text":"ライン連携を解除しました。"});
        })
          .catch(e=>console.log(e));
        });
    },

}