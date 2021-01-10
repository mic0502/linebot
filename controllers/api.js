const User = require('../models/User');

module.exports = {

    getData: (req,res) => {
        const pickup_users = 'SELECT * FROM TM_KOK;';
        const pickup_reservations = 'SELECT * FROM TM_RESERVE;';
        User.dbQuery(pickup_users)
            .then(users=>{
                User.dbQuery(pickup_reservations)
                    .then(reservations=>{
                        const data = {
                            users:users[0],
                            reservations:reservations[0]
                        }
                        res.status(200).json(data);
                    })
                    .catch(e=>console.log(e))
            })
            .catch(e=>console.log(e))           
   }

}