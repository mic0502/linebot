const User = require('../models/User');

module.exports = {

    getData: (req,res) => {
        const pickup_users = 'SELECT * FROM TM_KOK;';
        const pickup_reservations = 'SELECT * FROM TM_RESERVE;';
        User.dbQuery(pickup_users,'顧客情報照会')
            .then(users=>{
                User.dbQuery(pickup_reservations,'予約情報照会')
                    .then(reservations=>{
                        const data = {
                            users:users,
                            reservations:reservations
                        }
                        res.status(200).json(data);
                    })
                    .catch(e=>console.log(e))
            })
            .catch(e=>console.log(e))           
   },

    putUser: (req,res) => {
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

    delUser: (req,res) => {
        const id = parseInt(req.params.id);
        const delete_query = `DELETE FROM TM_RESERVE WHERE id=${id};`;
        User.dbQuery(delete_query,'予約情報削除')
            .then(message=>{
                res.status(200).send('予約削除しました');
            })
            .catch(e=>console.log(e.stack));
     }

}