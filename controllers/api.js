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
   }

}