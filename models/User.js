require('dotenv').config();  //本番
const { response } = require('express');
const mysql = require('mysql')
const connection = mysql.createConnection({
    host:process.env.ENV_HOST,
    database:process.env.ENV_DATABASE,
    user:process.env.ENV_USER,
    password:process.env.ENV_PASSWORD
});


module.exports = {
    dbQuery:(text_query,order)=>{
        return new Promise((resolve,reject)=>{
            connection.query(text_query, (error, results) => {
                if (error){
                    console.log('データベース失敗');
                    reject(error)
                }else{
                    console.log(`データベース成功 ${order}：${text_query}`);
                    resolve(results);
                };
            })
        });
    }

}
