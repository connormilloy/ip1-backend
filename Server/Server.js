const express = require('express');
const app = express();

// Import the accounts routes and expose them to the server file
const accounts = require('./Routes/Accounts/Accounts');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Tell the express application to associate all accounts routes with the url prefix 'accounts'
// For account creation, the URL is now '/accounts/new-account'
app.use('/accounts', accounts);

app.listen(3000, () => {
    console.log('Server live!');
})