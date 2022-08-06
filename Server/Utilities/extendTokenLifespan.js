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
                resolve(result[0].userID)
            }
        })
    })
}

const extendTokenLifespan = (email, db) => {
    return new Promise(async (resolve, reject) => {
        getUserID(email, db)
            .then(userID => {
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