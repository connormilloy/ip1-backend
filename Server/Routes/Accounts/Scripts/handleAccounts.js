const bcrypt = require('bcrypt');

const saltAndHashPassword = plaintextPassword => {
    return new Promise(async (resolve, reject) => {
        // Define the number of rounds for salting the plaintext data
        // Higher rounds = longer processing times
        const saltRounds = 10;

        // Call the genSalt function to generate a new salted string
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if(err){
                // Throw any errors back to a .catch() statement in the parent function
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

const newAccount = async account => {
    return new Promise(async (resolve, reject) => {
        if(1){
            resolve();
        } else {
            reject();
        }
    })
}

exports.newAccount = newAccount;