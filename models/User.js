const { Client } = require('pg');
const connection = new Client({
    user:process.env.PG_USER,
    host:process.env.PG_HOST,
    database:process.env.PG_DATABASE,
    password:process.env.PG_PASSWORD,
    port:5432
  });
connection.connect();

class Create {
    constructor({name,id,password}){
        this.name = name;
        this.id = id;
        this.password = password;
    }

    queryArray(){
        return [this.name,this.id,this.password];
    }
}

module.exports = {

    create:({name,id,password})=>{
        return new Promise((resolve,reject)=>{
            const createUser = new Create({
                name:name,
                id:id,
                password:password
            }).queryArray();

            console.log('createUser:',createUser);

            const rank = 'D';
            const point = '0';
            const insert_query = {
                text:`INSERT INTO users (name,login_id,login_password,rank,point) VALUES($1,$2,$3,'${rank}','${point}');`,
                values:createUser
            };
            console.log(`INSERT INTO users (name,login_id,login_password,rank,point) VALUES($1,$2,$3,'${rank}','${point}');`);
            connection.query(insert_query)
                .then(res=>{
                    console.log('新規登録成功');
                    resolve('post succeeded!');
                })
                .catch(e=>console.log(e)); 
        })
    },

    check:(loginId,password,lineId)=>{
        return new Promise((resolve,reject)=>{
            let select_query;
            // 引数にラインIDがあるかどうかで検索条件変更
            if(lineId == ""){   
                select_query = {text:`SELECT * FROM users WHERE login_id='${loginId}' and login_password='${password}';`};
            }else{
                select_query = {text:`SELECT * FROM users WHERE line_id='${lineId}';`};
            }
            connection.query(select_query)
                .then(res=>{
                    console.log('ユーザーテーブル検索完了');
                    resolve(res.rowCount);
                })
                .catch(e=>console.log(e));
        });
    },

    getKokData:(lineId)=>{
        return new Promise((resolve,reject)=>{
            let select_query;
            select_query = {text:`SELECT * FROM users WHERE line_id='${lineId}';`};
            connection.query(select_query)
                .then(res=>{
                    console.log('顧客情報検索完了');
                    resolve(res.rows[0]);
                })
                .catch(e=>console.log(e));
        });
    }
}
