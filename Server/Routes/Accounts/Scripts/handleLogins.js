const bcrypt = require('bcrypt');

const generateToken = () => {
    const charSet = "ABCDEFGHIJKLMOPQRSTUVWXYZ0123456789";
    let token = "";

    for(let i = 0; i < 20; i++){
        token += charSet[Math.floor(Math.random()* charSet.length)];
    }

    return token;
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

exports.validateLogin = validateLogin;