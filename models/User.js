require('dotenv').config();
const mysql = require('mysql')
const dbconfig = {
    host:process.env.ENV_HOST,
    database:process.env.ENV_DATABASE,
    user:process.env.ENV_USER,
    password:process.env.ENV_PASSWORD
};
var pool = mysql.createPool(dbconfig);

module.exports = {
    dbQuery:(text_query,order)=>{
        return new Promise((resolve,reject)=>{

            pool.getConnection(function(err, connection){
                connection.query(text_query, function(err, rows, fields){
                    if(err){
                        console.log(`データベース失敗 ${order}：${text_query}`);
                        reject(err);
                    }else{
                        console.log(`データベース成功 ${order}：${text_query}`);
                        resolve(rows);
                    }
                    connection.release();
                });
            });
        });
    }

}
