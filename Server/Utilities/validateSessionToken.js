const moment = require('moment-timezone');

moment.createFromInputFallback=function (config){
    config._d = new Date(config._i);
}

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

const checkTokenExpiry = (expiry) => {
    const now = moment();
    return moment(expiry).diff(now, 'seconds') > 1;
}

const validateSessionToken = (email, token, db) => {
    return new Promise(async (resolve, reject) => {
        getUserID(email, db)
        .then(userID => {
            getSessionToken(userID, db)
                .then(sessionInfo => {
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