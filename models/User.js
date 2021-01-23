require('dotenv').config();
const mysql = require('mysql')
const dbconfig = {
    host:process.env.ENV_HOST,
    database:process.env.ENV_DATABASE,
    user:process.env.ENV_USER,
    password:process.env.ENV_PASSWORD
};
const connection = mysql.createConnection(dbconfig);


module.exports = {
    condb:()=>{
        console.log('テスト通過')
        connection = mysql.createConnection(dbconfig);
    },
    
    dbQuery:(text_query,order)=>{
        return new Promise((resolve,reject)=>{
            connection.query(text_query, (error, results) => {
                if (error){
                    console.log(`データベース失敗：${text_query}`);
                    reject(error)
                }else{
                    console.log(`データベース成功 ${order}：${text_query}`);
                    resolve(results);
                };
            })
        });
    }

}
