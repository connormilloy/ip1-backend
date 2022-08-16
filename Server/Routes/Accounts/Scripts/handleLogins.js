const bcrypt = require('bcrypt');
const moment = require('moment-timezone');

const { getUserAccountLevel } = require('./handleAccounts');

// 'Randomly' generate a 20 character string to serve as a unique session token and return it
const generateToken = () => {
    const charSet = "ABCDEFGHIJKLMOPQRSTUVWXYZ0123456789";
    let token = "";

    for(let i = 0; i < 20; i++){
        token += charSet[Math.floor(Math.random()* charSet.length)];
    }

    return token;
}

// Attach a login token to a userID in the LoginTokens table
const addLoginTokenToUser = (userID, db) => {
    return new Promise(async (resolve, reject) => {
        // Generate a new token
        const token = generateToken();

        // Generate a new expiry time, 30 minutes from now
        const tokenExpiry = moment().add(30, 'minutes');
    
        // Serialize multiple DB operations
        // First, attempt to create the new userID entry in LoginTokens, or move on if it exists
        // Then, update the corresponding record with the new token/expiry
        // The reason this needs to be INSERT OR IGNORE INTO is that we're not sure if we're replacing values (not first login) or creating them (first login)
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

// Compare a plaintext password to a hashed string
// If they match, return true to validate the login
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

// Find and return an account from the 'Users' table, based on email address
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

// Find and return the number of incorrect login attempts against a userID, we need this value to see if an account should be locked
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

// Reset the number of bad login attempts to 0, this is called on a successful user login
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

// Mark an account as locked on the 'Users' table for entering the wrong password 3 times
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

// Increment the incorrectLogins value for a userID by 1 and then check to see if it should be locked
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

// Validate a login attempt
const validateLogin = (loginInfo, db) => {
    return new Promise(async (resolve, reject) => {
        // Fetch the account from the 'Users' table
        getAccountFromDB(loginInfo?.email, db)
            .then(account => {
                // If the accountLocked flag is true on the account, immediately resolve the function and prevent the login
                if(account['accountLocked'] == "true"){
                    resolve('Account Locked');
                } else {
                    // Compare the user's password from the login form to the known password hash in the database
                    comparePasswordHashes(account.password, loginInfo.password)
                    .then(valid => {
                        if(valid){
                            // Reset the incorrectLogins value on a successful login
                            resetIncorrectLoginAttempts(account.userID, db)
                                .then(() => {
                                    // Get the user's account level to send to the frontend with the auth object
                                    getUserAccountLevel(account.userID, db)
                                        .then(res => {
                                            const accountLevel = res.accountLevel;
                                            // Add a new session token to the user, then return it in an object
                                            // The frontend will use this token to validate future API requests
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
                            // Increment the loginAttempts value and return false to indicate a bad login
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
            // Reject if there is no account for the email address entered on the login form
            .catch(e => reject('no account'))
    })
}

exports.validateLogin = validateLogin;