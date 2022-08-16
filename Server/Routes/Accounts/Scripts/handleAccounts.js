const bcrypt = require('bcrypt');

// Find and return the userID of an account from the 'Users' table using an email address
const getUserID = (email, db) => {
    return new Promise(async (resolve, reject) => {
        db.all('SELECT userID FROM Users WHERE email = ?', [email], (err, result) => {
            if(err){
                console.log(err);
                reject(err);
            } else {
                resolve(result[0]['userID']);
            }
        })
    })
}

// Insert a new salesperson into the 'Salespeople' table
const addSalesperson = (userID, specialty, db) => {
    return new Promise(async (resolve, reject) => {
        db.run('INSERT INTO Salespeople(salespersonID, specialtyCompanyCategory) VALUES(?, ?)', [userID, specialty], err => {
            if(err){
                console.log(err);
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

// Convert a user account to a salesperson account
// The user will be updated in the 'Users' table to have an accountLevel of 2, then addSalesperson() will be called
const convertUserAccountToSalesperson = (data, db) => {
    return new Promise(async (resolve, reject) => {
        getUserID(data.email, db)
            .then(userID => {
                db.run('UPDATE Users SET accountLevel = ? WHERE userID = ?', [2, userID], err => {
                    if(err){
                        console.log(err);
                        reject(err);
                    } else {
                        addSalesperson(userID, data.specialty, db)
                            .then(() => resolve())
                            .catch(e => reject(e))
                    }
                })
            })
    })
}

const saltAndHashPassword = plaintextPassword => {
    return new Promise(async (resolve, reject) => {
        // Define the number of rounds for salting the plaintext data
        // Higher rounds = longer processing times
        const saltRounds = 10;

        // Call the genSalt function to generate a new salted string
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if(err){
                reject(err);
            } else {
                // Hash the plaintext password after adding the salted string
                bcrypt.hash(plaintextPassword, salt, (err, hash) => {
                    if(err) {
                        // Throw any errors back to a .catch() statement in the parent function
                        reject(err);
                    } else {
                        // Resolve the promise and return the hash to a .then() statement in the parent function
                        resolve(hash);
                    }
                })
            }

        })
    })
}

// Insert a new account into the 'Users' table
const newAccount = async (account, db) => {
    return new Promise(async (resolve, reject) => {
        // Generate a new salted and hashed password from the password field on the registration form
        const saltedPassword = saltAndHashPassword(account.password)
            .then(hash => {
                // Mutate the account object, set the password key to the newly generated hash
                account['password'] = hash;

                // Insert the data into the Users table
                db.run("INSERT INTO Users(name, email, password, accountLevel, companyName, companyCategory, loginAttempts, accountLocked) VALUES(?, ?, ?, ?, ?, ?, ?, ?)", [account.name, account.email, account.password, account.accountLevel, account.companyName, account.companyCategory, 0, "false"], err => {
                    if(err){
                        console.log(err);
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            })
            .catch(e => reject(e))
    })
}

// Find and return the account level of a user by ID
const getUserAccountLevel = async (userID, db) => {
    return new Promise(async (resolve, reject) => {
        db.all("SELECT accountLevel FROM Users WHERE userID = ?", [userID], (err, result) => {
            if(err){
                console.log(err);
                reject(err);
            } else {
                resolve(result[0]);
            }
        })
    })
}

// Find and return a user's company category by their ID
const getUserAccountCategory = (userID, db) => {
    return new Promise(async (resolve, reject) => {
        db.all("SELECT companyCategory FROM Users WHERE userID = ?", [userID], (err, result) => {
            if(err){
                console.log(err);
                reject(err);
            } else {
                resolve(result[0]);
            }
        })
    })
}

exports.newAccount = newAccount;
exports.convertUserAccountToSalesperson = convertUserAccountToSalesperson;
exports.getUserAccountLevel = getUserAccountLevel;
exports.getUserAccountCategory = getUserAccountCategory;