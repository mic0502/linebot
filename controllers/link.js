const request = require('request-promise');

module.exports = {

    accountLink: (req,res) => {
        const line_uid = req.query.line_uid;
        console.log('line_uid:',line_uid);
        const options = {
            url:`https://api.line.me/v2/bot/user/${line_uid}/linkToken`,
            method:'POST',
            headers:{
                'Authorization':'Bearer ahd1DH4XRUUjgL11hcQUMQxPXS4Xcr8UU1KOAzKIokK6LVe1I/ERSJ7fh8Epp8vLPrH+nB3oz52G0X3uBZpSvlxU74lkJJgY3oGQ4lc8ApLARAKN/7KOeIFNp1PdjXJ5XsNbxJLNDuQxB3YunWUJBQdB04t89/1O/w1cDnyilFU='
            },
            followAllRedirects: false
        }

        request(options)
            .then(body=>{
                const parsedBody = JSON.parse(body);
                console.log('parsedBody:',parsedBody);
                console.log('linkToken:',parsedBody["linkToken"]);
                res.status(200).send(parsedBody["linkToken"]);
                // res.redirect(302,`https://linebot-account-renkei.herokuapp.com?linkToken=${parsedBody["linkToken"]}`)
            });
    }
}