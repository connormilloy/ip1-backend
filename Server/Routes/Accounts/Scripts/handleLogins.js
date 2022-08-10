const bcrypt = require('bcrypt');
const moment = require('moment-timezone');

const { getUserAccountLevel } = require('./handleAccounts');

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

const returnIncorrectLoginAttempts = (userID, db) => {
    return new Promise(async (resolve, reject) => {
        db.all("SELECT loginAttempts FROM Users WHERE userID = ?", [userID], (err, result) => {
            if(err){
                reject(err);
            } else {
                resolve(result[0]?.loginAttempts)
            }
        })
    })
}

const resetIncorrectLoginAttempts = (userID, db) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE Users SET loginAttempts = 0 WHERE userID = ?", [userID], err => {
            if(err){
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

const lockAccount = (userID, db) => {
    return new Promise(async (resolve, reject) => {
        db.run("UPDATE Users SET accountLocked = 'true' WHERE userID = ?", [userID], err => {
            if(err){
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

const incrementIncorrectLoginAttempts = (userID, db) => {
    return new Promise(async (resolve, reject) => {
        returnIncorrectLoginAttempts(userID, db)
            .then(attempts => {
                let loginAttempts = Number(attempts);
                loginAttempts++;

                if(loginAttempts >= 3){
                    lockAccount(userID, db)
                        .then(() => resolve())
                        .catch(e => reject(e))
                }

                db.run("UPDATE Users SET loginAttempts = ? WHERE userID = ?", [loginAttempts, userID], err => {
                    if(err){
                        reject(err);
                    } else {
                        resolve(loginAttempts);
                    }
                })
            })
    })
}

const validateLogin = (loginInfo, db) => {
    return new Promise(async (resolve, reject) => {
        getAccountFromDB(loginInfo?.email, db)
            .then(account => {
                if(account['accountLocked'] == "true"){
                    resolve('Account Locked');
                } else {
                    comparePasswordHashes(account.password, loginInfo.password)
                    .then(valid => {
                        if(valid){
                            resetIncorrectLoginAttempts(account.userID, db)
                                .then(() => {
                                    getUserAccountLevel(account.userID, db)
                                        .then(res => {
                                            const accountLevel = res.accountLevel;
                                            addLoginTokenToUser(account.userID, db)
                                                .then((token) => resolve({
                                                    "valid": true,
                                                    "token": token,
                                                    "userID": account.userID,
                                                    "accountLevel": accountLevel
                                                }))
                                            .catch(e => reject(e))
                                        })
                                    .catch(e => reject(e))
                                })
                        } else {
                            incrementIncorrectLoginAttempts(account.userID, db)
                                .then(loginAttempts => {
                                    resolve({
                                        "valid": false,
                                        "loginAttempts": loginAttempts
                                    });
                                })
                        }
                    })
                    .catch(e => reject(e))
                }
            })
            .catch(e => reject('no account'))
    })
}

exports.validateLogin = validateLogin;