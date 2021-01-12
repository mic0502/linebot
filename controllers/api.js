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
        const {cuttime,shampootime,menu} = req.body;
        console.log(cuttime)
        console.log(shampootime)
        
        const update_query = `UPDATE users SET (selecteddate,selectedtime,menu) = (${cuttime},${shampootime},${menu}) WHERE id=${id};`;
        User.dbQuery(update_query,'予約情報変更')
            .then(message=>{
                console.log('message:',message);
                res.status(200).send(message);
            })
            .catch(e=>console.log(e.stack));
     }

}