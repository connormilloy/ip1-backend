const bcrypt = require('bcrypt');
const moment = require('moment-timezone');

const generateToken = () => {
    const charSet = "ABCDEFGHIJKLMOPQRSTUVWXYZ0123456789";
    let token = "";

    for(let i = 0; i < 20; i++){
        token += charSet[Math.floor(Math.random()* charSet.length)];
    }

    return token;
}

const addLoginTokenToUser = (userID, db) => {
    return new Promise(async (resolve, reject) => {
        const token = generateToken();
        const tokenExpiry = moment().add(30, 'minutes');
    
        db.serialize(() => {
            db.run('INSERT OR IGNORE INTO LoginTokens(userID, token, tokenExpiryDateTime) VALUES(?, ?, ?)', [userID, token, tokenExpiry], err => {
                if(err) reject(err);
            });
            db.run('UPDATE LoginTokens SET token = ?, tokenExpiryDateTime = ? WHERE userID = ?', [token, tokenExpiry, userID], err => {
                if(err){
                    reject(err);
                } else {
                    resolve(token);
                }
            })
        })
    })
}

const comparePasswordHashes = (dbPassword, loginPassword) => {
    return new Promise(async (resolve, reject) => {
        bcrypt.compare(loginPassword, dbPassword, (err, res) => {
            if(err){
                reject(err);
            } else {
                if(res){
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        })
    })
}

const getAccountFromDB = (email, db) => {
    return new Promise(async (resolve, reject) => {
        db.all('SELECT * FROM Users WHERE email = ?', [email], (err, result) => {
            if(err){
                reject(err);
            } else {
                resolve(result[0]);
            }
        })
    })
}

const validateLogin = (loginInfo, db) => {
    return new Promise(async (resolve, reject) => {
        getAccountFromDB(loginInfo?.email, db)
            .then(account => {
                comparePasswordHashes(account.password, loginInfo.password)
                    .then(valid => {
                        if(valid){
                            addLoginTokenToUser(account.userID, db)
                                .then((token) => resolve({
                                    "valid": true,
                                    "token": token,
                                    "userID": account.userID
                                }))
                                .catch(e => reject(e))
                        } else {
                            resolve({
                                "valid": false
                            });
                        }
                    })
                    .catch(e => reject(e))
            })
            .catch(e => reject('no account'))
    })
}

exports.validateLogin = validateLogin;