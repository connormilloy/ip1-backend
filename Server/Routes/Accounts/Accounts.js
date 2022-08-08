const express = require('express');
const router = express.Router();
const security = require('../../Utilities/Security');

const { validateSessionToken } = require('../../Utilities/validateSessionToken');

const accounts = require('./Scripts/handleAccounts');
const logins = require('./Scripts/handleLogins');

// Create a new POST endpoint with the path 'new-account'
router.post('/new-account', (req, res) => {
    const db = req.app.get('db');

    // Define data as req.body for readability
    const data = req.body;

    // Generate an account object using the data sent in the request
    const account = {
        "name": data?.name,
        "companyName": data?.companyName,
        "email": data?.email.toLowerCase(),
        "password": data?.password,
        "companyCategory": data?.companyCategory,
        "accountLevel": 1
    }

    // Pass the data to the new account function to be handled
    // Return a HTTP status depending on whether or not the request was handled successfully
    accounts.newAccount(account, db)
        .then(() => res.send("Account added."))
        .catch(e => res.status(400).send(e))
})

router.get('/test-get-all/:db', (req, res) => {
    const db = req.app.get('db');
    const target = req.params.db;
    db.all(`SELECT * FROM ${target}`, (err, results) => {
        if(err){
            res.send(err);
        } else {
            res.send(results)
        }
    })
})

router.post('/set-account-as-salesperson', security.validateAdmin, (req, res) => {
    const db = req.app.get('db');
    const salespersonData = req.body;

    accounts.convertUserAccountToSalesperson(salespersonData, db)
        .then(() => res.send('Account converted to salesperson.'))
        .catch(e => res.send(e))
})

router.post('/login', (req, res) => {
    const db = req.app.get('db');
    const loginInfo = req.body;

    logins.validateLogin(loginInfo, db)
        .then(loginValid => res.send(loginValid))
        .catch(e => {
            if(e === 'no account') {
                res.send('NOACCOUNT');
            }
        })
})

router.post('/validate-session', (req, res) => {
    const db = req.app.get('db');
    const sessionInfo = req.body;

    validateSessionToken(sessionInfo.email, sessionInfo.token, db)
        .then(isValid => res.send(isValid))
        .catch(e => console.log(e))
})

router.get('/get-user-category/:userID', security.validateSessionToken, (req, res) => {
    const db = req.app.get('db');
    
    accounts.getUserAccountCategory(req.params.userID, db)
        .then(account => {
            res.send(account?.companyCategory);
        })
        .catch(e => res.send(e))
})

module.exports = router;