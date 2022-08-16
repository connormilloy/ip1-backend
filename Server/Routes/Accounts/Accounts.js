const express = require('express');
const router = express.Router();
const security = require('../../Utilities/Security');

const { validateSessionToken } = require('../../Utilities/validateSessionToken');

const accounts = require('./Scripts/handleAccounts');
const logins = require('./Scripts/handleLogins');

// Create a new account
router.post('/new-account', (req, res) => {
    const db = req.app.get('db');

    const data = req.body;

    const account = {
        "name": data?.name,
        "companyName": data?.companyName,
        "email": data?.email.toLowerCase(),
        "password": data?.password,
        "companyCategory": data?.companyCategory,
        "accountLevel": 1
    }

    // Pass the data to the new account function to be handled
    accounts.newAccount(account, db)
        .then(() => res.send({"success": true, message: "Successfully created account! You may now log in."}))
        .catch(e => res.send({"success": false, message: "Failed to create account. This email address may already be in use."}))
})

// Set an account as a salesperson 
// There is no point of entry for this endpoint on the frontend
// It must be done using cURL or Postman using the API key environment variable
router.post('/set-account-as-salesperson', [security.validateAdmin], (req, res) => {
    const db = req.app.get('db');
    const salespersonData = req.body;

    accounts.convertUserAccountToSalesperson(salespersonData, db)
        .then(() => res.send('Account converted to salesperson.'))
        .catch(e => res.send(e))
})

// Handle a new login
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

// Validate a user's session
// Replaced by the security.validateSessionToken middleware but remains as a proof of concept
router.post('/validate-session', (req, res) => {
    const db = req.app.get('db');
    const sessionInfo = req.body;

    validateSessionToken(sessionInfo.email, sessionInfo.token, db)
        .then(isValid => res.send(isValid))
        .catch(e => console.log(e))
})

// Find an account's company category by user ID
router.get('/get-user-category/:userID', [security.validateSessionToken, security.extendToken], (req, res) => {
    const db = req.app.get('db');
    
    accounts.getUserAccountCategory(req.params.userID, db)
        .then(account => {
            res.send(account?.companyCategory);
        })
        .catch(e => res.send(e))
})

module.exports = router;