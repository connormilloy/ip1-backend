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
                resolve(result[0]?.userID)
            }
        })
    })
}

// Get a sessionToken from a userID
const getSessionToken = (userID, db) => {
    return new Promise(async (resolve, reject) => {
        db.all('SELECT * from LoginTokens WHERE userID = ?', [userID], (err, result) => {
            if(err){
                reject();
            } else {
                resolve(result[0])
            }
        })
    })
}

// Check if a token has expired by comparing it to the current time
const checkTokenExpiry = (expiry) => {
    const now = moment();
    return moment(expiry).diff(now, 'seconds') > 1;
}

// Validate an email and session token pairing
// These are sent in API requests from the frontend
const validateSessionToken = (email, token, db) => {
    return new Promise(async (resolve, reject) => {
        // Get the userID using the email
        getUserID(email, db)
        .then(userID => {
            // Get the sessionToken using the userID
            getSessionToken(userID, db)
                .then(sessionInfo => {
                    // If the tokens match and the token hasn't expired, the request is valid
                    if(token === sessionInfo?.token && checkTokenExpiry(sessionInfo?.tokenExpiryDateTime)){
                        resolve(true)
                    } else {
                        resolve(false);
                    }
                })
                .catch(e => reject(e))
        })
        .catch(e => reject(e))
    })

}

exports.validateSessionToken = validateSessionToken;