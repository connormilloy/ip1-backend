const express = require('express');
const cors = require('cors');
const app = express();

const accounts = require('./Routes/Accounts/Accounts');
const appointments = require('./Routes/Appointments/Appointments');

const sqlite3 = require('sqlite3').verbose();

// Import Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

// Import Routes
app.use('/accounts', accounts);
app.use('/appointments', appointments);

// Connect to the database
app.set('db', new sqlite3.Database('../Database/AppointmentSystem.db', err => {
    if(err) { console.log('Error connecting to DB!') } else { console.log('Connected to DB!') };
}))

// Start the server and have it listen on port 4000
app.listen(4000, () => {
    console.log('Server live!');
})