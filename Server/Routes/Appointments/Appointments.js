const express = require('express');
const router = express.Router();
const security = require('../../Utilities/Security');

const appointments = require('./Scripts/handleAppointments');
const salespeople = require('./Scripts/handleSalespeople');

router.post('/create-new-appointment', [security.validateSessionToken, security.extendToken], (req, res) => {
    const db = req.app.get('db');
    const appointmentData = req.body;

    appointments.createNewAppointment(appointmentData, db)
        .then(() => res.send('Created new appointment.'))
        .catch(e => res.send(e))
})

router.get('/get-appointments-for-salesperson/:salespersonID', (req, res) => {
    const db = req.app.get('db');

    appointments.getAllAppointmentsForSalesperson(req.params.salespersonID, db)
        .then(response => res.send(response))
        .catch(e => res.send(e))
})

router.get('/get-appointments-for-user/:userID', (req, res) => {
    const db = req.app.get('db');

    appointments.getAllAppointmentsForUser(req.params.userID, db)
        .then(response => res.send(response))
        .catch(e => res.send(e))
})

router.get('/get-salespeople-by-specialty/:specialty', (req, res) => {
    const db = req.app.get('db');

    salespeople.getSalespeopleBySpecialty(req.params.specialty, db)
        .then(result => {
            res.send(result)
        })
        .catch(e => res.send(e))
})

module.exports = router;