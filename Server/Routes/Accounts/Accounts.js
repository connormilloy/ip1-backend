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
        .then(() => res.send({"success": true, message: "Successfully created account! You may now log in."}))
        .catch(e => res.send({"success": false, message: "Failed to create account. This email address may already be in use."}))
})

router.post('/set-account-as-salesperson', [security.validateAdmin], (req, res) => {
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
        .then(login => {
            if(login === "Account Locked"){
                res.send('ACCOUNTLOCKED');
            } else {
                res.send(login);
            }
        })
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

router.get('/get-user-category/:userID', [security.validateSessionToken, security.extendToken], (req, res) => {
    const db = req.app.get('db');
    
    accounts.getUserAccountCategory(req.params.userID, db)
        .then(account => {
            res.send(account?.companyCategory);
        })
        .catch(e => res.send(e))
})

module.exports = router;