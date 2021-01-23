require('dotenv').config();
const { response } = require('express');
const mysql = require('mysql')
const db_config = mysql.createConnection({
    host:process.env.ENV_HOST,
    database:process.env.ENV_DATABASE,
    user:process.env.ENV_USER,
    password:process.env.ENV_PASSWORD
});

function handleDisconnect() {
    connection = mysql.createConnection(db_config);
    //connection取得
    connection.connect(function(err) {
        if (err) {
            setTimeout(handleDisconnect, 1000);
        }
    });
    
    //error('PROTOCOL_CONNECTION_LOST')時に再接続
    connection.on('error', function(err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();


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
        });
    }

}
