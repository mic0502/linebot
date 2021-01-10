const User = require('../models/User');

module.exports = {

    getData: () => {
        const pickup_users = 'SELECT * FROM users;';
        const pickup_reservations = 'SELECT * FROM reservations;';
        User.dbQuery(pickup_users)
            .then(users=>{
                User.dbQuery(pickup_reservations)
                    .then(reservations=>{
                        const data = {
                            users:users.rows,
                            reservations:reservations.rows
                        }
                        res.status(200).json(data);
                    })
                    .catch(e=>console.log(e))
            })
            .catch(e=>console.log(e))           
   }

}