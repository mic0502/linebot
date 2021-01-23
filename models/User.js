require('dotenv').config();
const { response } = require('express');
const mysql = require('mysql')
const connect_config = {
    host:process.env.ENV_HOST,
    database:process.env.ENV_DATABASE,
    user:process.env.ENV_USER,
    password:process.env.ENV_PASSWORD
}
const connection = mysql.createPool(connect_config);


module.exports = {
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
            connection.on('error', function(err) {
                if(err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.log('=> RECONECT...');
                    //再接続
                    connection = mysql.createPool(connect_config);
                } else {
                    throw err;
                }              
            });

        });
    }

}
