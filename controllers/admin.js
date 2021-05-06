const User = require('../models/User');
const line = require('@line/bot-sdk');
const client = new line.Client({channelAccessToken: process.env.ENV_CHANNEL_ACCESS_TOKEN});

module.exports = {

    getkokData: (req,res) => {
        const pickup_customer = 'SELECT * FROM TM_KOK ORDER BY login_id';
        User.dbQuery(pickup_customer,'顧客情報照会')
            .then(customers=>{
                res.status(200).json(customers);
            })
            .catch(e=>console.log(e))           
    },

    updateCustomer: (req,res) => {
        const login_id = parseInt(req.params.login_id);
        const {sbt} = req.body;
        const update_query = `UPDATE TM_KOK SET sbt='${sbt}' WHERE login_id=${login_id};`;
        User.dbQuery(update_query,'顧客情報変更')
            .then(message=>{
                res.status(200).json({sbt:sbt});
            })
            .catch(e=>console.log(e.stack));
    },

    delCustomer: (req,res) => {
        const login_id = parseInt(req.params.login_id);
        const delete_query = `DELETE FROM TM_KOK WHERE login_id=${login_id};`;
        User.dbQuery(delete_query,'顧客情報削除')
            .then(message=>{
                res.status(200).send('顧客情報削除しました');
            })
            .catch(e=>console.log(e.stack));
    },

    menuChange: (req,res) => {
        const menuflg = parseInt(req.params.menu_flg);

        let pickup_customer;
        let richmenuid;

        if(menuflg!=0){
            // フェアメニューの場合は種別２の顧客を抽出
            pickup_customer = "SELECT line_id FROM TM_KOK WHERE sbt = '2' AND line_id <> ''";
            richmenuid = process.env.ENV_RICHMENUID_FAIR;
        }else{
            pickup_customer = "SELECT line_id FROM TM_KOK WHERE line_id <> ''";
            richmenuid = process.env.ENV_RICHMENUID;
        }

        User.dbQuery(pickup_customer,'種別２の顧客抽出')
            .then(data=>{
                let customers = new Array();
                // ループして配列に格納
                data.forEach(customersObj=>{customers.push(customersObj.line_id);})
                
                // 配列に入れたユーザーのメニューを配信する
                client.linkRichMenuToMultipleUsers(richmenuid,customers);
                res.status(200).send('メニュー更新しました。');
            })
            .catch(e=>console.log(e))
    },
    
    getReserve: (req,res) => {
        // 予約テーブルと顧客テーブルを内部結合して結果を返す
        // const pickup_reserve = 'SELECT * FROM TM_RESERVE INNER JOIN TM_KOK ON TM_RESERVE.login_id = TM_KOK.login_id WHERE CAST(REPLACE(TM_RESERVE.selecteddate, "/", "") AS SIGNED) >= CURRENT_DATE;';
        const pickup_reserve = 'SELECT * FROM TM_RESERVE INNER JOIN TM_KOK ON TM_RESERVE.login_id = TM_KOK.login_id ORDER BY ID';
        User.dbQuery(pickup_reserve,'予約情報照会')
            .then(reservations=>{
                res.status(200).json(reservations);
            })
            .catch(e=>console.log(e))           
   },

    putReserve: (req,res) => {
        const id = parseInt(req.params.id);
        const {selecteddate,selectedtime,menu} = req.body;
        const update_query = `UPDATE TM_RESERVE SET selecteddate='${selecteddate}',selectedtime='${selectedtime}',menu='${menu}' WHERE id=${id};`;
        User.dbQuery(update_query,'予約情報変更')
            .then(message=>{
                res.status(200).json({
                    selecteddate:selecteddate,
                    selectedtime:selectedtime,
                    menu:menu
                });
            })
            .catch(e=>console.log(e.stack));
     },

    delReserve: (req,res) => {
        const id = parseInt(req.params.id);
        const delete_query = `DELETE FROM TM_RESERVE WHERE id=${id};`;
        User.dbQuery(delete_query,'予約情報削除')
            .then(message=>{
                res.status(200).send('予約削除しました');
            })
            .catch(e=>console.log(e.stack));
     },

     getfairData: (req,res) => {
        const pickup_customer = 'SELECT * FROM TM_FAIR ORDER BY id';
        User.dbQuery(pickup_customer,'フェア情報照会')
            .then(fairs=>{
                res.status(200).json(fairs);
            })
            .catch(e=>console.log(e))           
    }

}