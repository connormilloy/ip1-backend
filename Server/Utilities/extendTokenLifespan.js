const moment = require('moment-timezone');

// Modify the moment module to allow non ISO standard dates to be parsed
moment.createFromInputFallback=function (config){
    config._d = new Date(config._i);
}

// Get a userID from an email address
const getUserID = (email, db) => {
    return new Promise(async (resolve, reject) => {
        db.all('SELECT userID FROM Users WHERE email = ?', [email], (err, result) => {
            if(err){
                reject();
            } else {
                resolve(result[0].userID)
            }
        })
    })
}

// Extend the lifespan of a user's session token by 30 minutes
// This will be called any time a request is handled
const extendTokenLifespan = (email, db) => {
    return new Promise(async (resolve, reject) => {
        // Use the email address to get the userID
        getUserID(email, db)
            .then(userID => {
                // Define a new expiry date 30 mins from now and update the DB with it
                const newExpiry = moment().add(30, 'minutes');
                db.run('UPDATE LoginTokens SET tokenExpiryDateTime = ? WHERE userID = ?', [newExpiry, userID], err => {
                    if(err){
                        reject();
                    } else {
                        resolve();
                    }
                })
            })
    })
}

exports.extendTokenLifespan = extendTokenLifespan;