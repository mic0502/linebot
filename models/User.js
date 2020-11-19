const {randomBytes} = require('crypto')
const { Client } = require('pg');
const connection = new Client({
    user:process.env.PG_USER,
    host:process.env.PG_HOST,
    database:process.env.PG_DATABASE,
    password:process.env.PG_PASSWORD,
    port:5432
  });
connection.connect();

module.exports = {
    create:(insert_query)=>{
        return new Promise((resolve,reject)=>{
            connection.query(insert_query)
                .then(res=>{
                    console.log('新規登録成功');
                    resolve('create成功');
                })
                .catch(e=>console.log(e)); 
        })
    },

    check:(select_query)=>{
        return new Promise((resolve,reject)=>{
            connection.query(select_query)
                .then(res=>{
                    console.log('ユーザーテーブル検索完了');
                    resolve(res);
                })
                .catch(e=>console.log(e));
        });
    },

    insertNonce:(id,linkToken)=>{
        return new Promise((resolve,reject)=>{
            // nonce生成d
            const N=16
            const randomStrings = randomBytes(N).reduce((p,i)=> p+(i%36).toString(36),'');
            const buf = Buffer.from(randomStrings);
            const nonce = buf.toString('base64');

            // nonceテーブルへの挿入
            const insert_query = {
                text:'INSERT INTO nonces (login_id,nonce) VALUES($1,$2);',
                values:[`${id}`,`${nonce}`]
            }
            connection.query(insert_query)
                .then(response=>{
                    console.log('linktoken nonce:',linkToken,nonce);
                    const linkSentence = `accountLink?linkToken=${linkToken}&nonce=${nonce}`;
                    resolve(linkSentence);
                    // アイディアここでリダイレクトするのでなく、linktokenとnonceをフロント側へ返してあげ、フロント側で下記ページへGETする
                    // res.status(200).redirect(`https://access.line.me/dialog/bot/accountLink?linkToken=${linkToken}&nonce=${nonce}`);
                })
                .catch(e=>console.log(e));
            })
    },

    link:(nonce,lineId)=>{
        return new Promise((resolve,reject)=>{
            const select_query = {
                text:`SELECT * FROM nonces WHERE nonce='${nonce}';`
            };
            connection.query(select_query)
                .then(res=>{
                    const login_id = res.rows[0].login_id;
                    const selectUsers = {
                        text:`SELECT * FROM users WHERE login_id='${login_id}';`
                    }
                    connection.query(selectUsers)
                        .then(res1=>{
                            const name = res1.rows[0].name;
                            const password = res1.rows[0].login_password;
                            const update_query = {
                                text:`UPDATE users SET (name, login_id, login_password, line_id) = ('${name}', '${login_id}', '${password}', '${lineId}') WHERE login_id='${login_id}';`
                            }
                            connection.query(update_query)
                                .then(res2=>{
                                    console.log('アカウント連携成功！！');
                                    resolve('link succeeded!');
                                })
                                .catch(e=>console.log(e));
                        })
        
                })
                .catch(e=>console.log(e));
        });
    },

    release:(lineId)=>{
        return new Promise((resolve,reject)=>{

            const select_query = {
                text:`SELECT * FROM users WHERE line_id='${lineId}';`
            }
            connection.query(select_query)
                .then(res=>{
                    const name = res.rows[0].name;
                    const login_id = res.rows[0].login_id;
                    const password = res.rows[0].login_password;
                    const update_query = {
                        text:`UPDATE users SET (name, login_id, login_password, line_id) = ('${name}', '${login_id}', '${password}', '') WHERE login_id='${login_id}';`
                    }
                    connection.query(update_query)
                        .then(res2=>{
                            console.log('連携解除成功');
                            resolve('release succeeded!');
                        })
                        .catch(e=>console.log(e));
    
                })
                .catch(e=>console.log(e));

        });
    }

}
