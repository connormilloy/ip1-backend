const express = require('express');
const router = express.Router();

const { newAccount } = require('./Scripts/handleAccounts');

// Create a new POST endpoint with the path 'new-account'
router.post('new-account', (req, res) => {

    // Define data as req.body for readability
    const data = req.body;

    // Generate an account object using the data sent in the request
    const account = {
        "name": data?.name,
        "companyName": data?.companyName,
        "email": data?.email,
        "password": data?.password,
        "companyCategory": data?.companyCategory
    }

    // Pass the data to the new account function to be handled
    // Return a HTTP status depending on whether or not the request was handled successfully
    newAccount(account)
        .then(() => res.sendStatus(200))
        .catch(e => res.status(400).send(e))
})

module.exports = router;