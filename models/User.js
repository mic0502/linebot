// const { Client } = require('pg');
// const connection = new Client({
//     user:process.env.PG_USER,
//     host:process.env.PG_HOST,
//     database:process.env.PG_DATABASE,
//     password:process.env.PG_PASSWORD,
//     port:5432
//   });
// connection.connect();

// module.exports = {
//     create:(insert_query)=>{
//         return new Promise((resolve,reject)=>{
//             connection.query(insert_query)
//                 .then(res=>{
//                     console.log('データベースcreate成功');
//                     resolve('create成功');
//                 })
//                 .catch(e=>console.log(e)); 
//         })
//     },

//     check:(select_query)=>{
//         return new Promise((resolve,reject)=>{
//             connection.query(select_query)
//                 .then(res=>{
//                     console.log('データベースcheck成功');
//                     resolve(res);
//                 })
//                 .catch(e=>console.log(e));
//         });
//     },

//     insertNonce:(insert_query,linkToken,nonce)=>{
//         return new Promise((resolve,reject)=>{
//             connection.query(insert_query)
//                 .then(res=>{
//                     console.log('データベースinsertNonce成功');
//                     const linkSentence = `accountLink?linkToken=${linkToken}&nonce=${nonce}`;
//                     resolve(linkSentence);
//                 })
//                 .catch(e=>console.log(e));
//             })
//     },

//     link:(nonce,lineId)=>{
//         return new Promise((resolve,reject)=>{
//             const select_query = {text:`SELECT * FROM nonces WHERE nonce='${nonce}';`};
//             connection.query(select_query)
//                 .then(res=>{
//                     const login_id = res.rows[0].login_id;
//                     const update_query = {
//                         text:`UPDATE users SET line_id = '${lineId}' WHERE login_id='${login_id}';`
//                     }
//                     connection.query(update_query)
//                         .then(res1=>{
//                             console.log('データベースlink成功');
//                             resolve('link succeeded!');
//                         })
//                         .catch(e=>console.log(e));
//                 })
//                 .catch(e=>console.log(e));
//         });
//     },

//     release:(update_query)=>{
//         return new Promise((resolve,reject)=>{
//             connection.query(update_query)
//                 .then(releaseRes=>{
//                     console.log('データベースrelease成功');
//                     resolve('release succeeded!');
//                 })
//                 .catch(e=>console.log(e));

//         })
//     }

// }

const mysql = require('mysql')
const connection = mysql.createConnection({
    // host:'mysql10093.xserver.jp',
    // database:'xs311188_test',
    // user:'xs311188_user',
    // password:'asdfasdf1'
    host:process.env.DB_HOST,
    database:process.env.DB_DATABASE,
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD
});


module.exports = {
    create:(insert_query)=>{
        return new Promise((resolve,reject)=>{
            connection.query(insert_query, (error, results) => {
                if (error){reject(error)};
                    console.log('データベースcreate成功');
                    resolve(results);
                })
        })
    },

    check:(select_query)=>{
        return new Promise((resolve,reject)=>{
            console.log(select_query);
            connection.query(select_query, (error, results, fields) => {
                if (error){
                    console.log('データベースcheck失敗');
                    reject(error)
                }else{
                    console.log('データベースcheck成功');
                    resolve(results);
                };
            })
        });
    },

    insertNonce:(insert_query,linkToken,nonce)=>{
        return new Promise((resolve,reject)=>{
            connection.query(insert_query, (error, results) => {
                if (error){reject(error)};
                    console.log('データベースinsertNonce成功');
                    const linkSentence = `accountLink?linkToken=${linkToken}&nonce=${nonce}`;
                    resolve(linkSentence);
                }) 
            })
    },

    link:(nonce,lineId)=>{
        return new Promise((resolve,reject)=>{
            const select_query = `SELECT * FROM nonces WHERE nonce='${nonce}';`
            connection.query(select_query, (error, results, fields) => {
                if (error){reject(error)};
                    const login_id = results[0].login_id;
                    const update_query = `UPDATE users SET line_id = '${lineId}' WHERE login_id='${login_id}';`
                    connection.query(update_query, (error, results1) => {
                        if (error){reject(error)};
                            console.log('データベースlink成功');
                            resolve(results1);
                        })        
                })
        });
    },

    release:(update_query)=>{
        return new Promise((resolve,reject)=>{
            connection.query(update_query, (error, results) => {
                if (error) reject(error)
                    console.log('データベースrelease成功');
                    resolve(results);
                })
        })
    }

}
