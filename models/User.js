const mysql = require('mysql')
const connection = mysql.createConnection({
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
                if (error){ reject(error)};
                    console.log('データベースcheck成功');
                    resolve(results);
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
                    const login_id = results.rows[0].login_id;
                    const update_query = `UPDATE users SET (login_id, line_id) = ('${login_id}', '${lineId}') WHERE login_id='${login_id}';`
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
