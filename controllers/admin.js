const User = require('../models/User');

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
    const update_query = `UPDATE TM_RESERVE SET sbt='${sbt}' WHERE login_id=${login_id};`;
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
     }

}