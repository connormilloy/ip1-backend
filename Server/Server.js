const express = require('express');
const app = express();

// Import the accounts routes and expose them to the server file
const accounts = require('./Routes/Accounts/Accounts');
const sqlite3 = require('sqlite3').verbose();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Tell the express application to associate all accounts routes with the url prefix 'accounts'
// For account creation, the URL is now '/accounts/new-account'
app.use('/accounts', accounts);

app.set('db', new sqlite3.Database('../Database/AppointmentSystem.db', err => {
    if(err) { console.log('Error connecting to DB!') } else { console.log('Connected to DB!') };
}))

app.listen(3000, () => {
    console.log('Server live!');
})