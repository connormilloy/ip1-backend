const express = require('express');
const router = express.Router();
const security = require('../../Utilities/Security');

const appointments = require('./Scripts/handleAppointments');
const salespeople = require('./Scripts/handleSalespeople');

const { getUserAccountLevel } = require('../Accounts/Scripts/handleAccounts');

// Create a new appointment
router.post('/create-new-appointment', [security.validateSessionToken, security.extendToken], (req, res) => {
    const db = req.app.get('db');
    const appointmentData = req.body;

    appointments.createNewAppointment(appointmentData, db)
        .then(() => res.send('Appointment booked successfully!'))
        .catch(e => res.send(e))
})

// Return all appointments by userID
router.get('/get-appointments/:userID', [security.validateSessionToken, security.extendToken], (req, res) => {
    const db = req.app.get('db');

    getUserAccountLevel(req.params.userID, db)
        .then(account => {
            // If the account is level 1 (user), call the getAllAppointmentsForUser function and return the data
            if(account?.accountLevel === 1){
                appointments.getAllAppointmentsForUser(req.params.userID, db)
                    .then(response => {
                        // Pass the appointments to assignAppointmentStatuses to be formatted
                        appointments.assignAppointmentStatuses(response)
                            .then(response => { res.send(response) });
                    })
                    .catch(e => res.send(e))
            // If the account is level 2 (salesperson), call the getAllAppointmentsForSalesperson function instead
            } else if(account?.accountLevel === 2){
                appointments.getAllAppointmentsForSalesperson(req.params.userID, db)
                    .then(response => {
                        // Pass the appointments to assignAppointmentStatuses to be formatted
                        appointments.assignAppointmentStatuses(response)
                            .then(response => { res.send(response) });
                    })
                    .catch(e => res.send(e))
            } else {
                // Send an empty array if a problem exists with the user's account, it can only ever be 1 or 2 so anything else is a bad request
                res.send([]);
            }
        })
        .catch(e => res.send(e))

})

// Return all salespeople that match the target specialty
router.get('/get-salespeople-by-specialty/:specialty', [security.validateSessionToken, security.extendToken], (req, res) => {
    const db = req.app.get('db');

    salespeople.getSalespeopleBySpecialty(req.params.specialty, db)
        .then(result => {
            res.send(result)
        })
        .catch(e => res.send(e))
})

// Cancel and delete an appointment from the DB
router.post('/cancel-appointment', [security.validateSessionToken, security.extendToken], (req, res) => {
    const db = req.app.get('db');
    const appointmentID = req.body?.appointmentID;

    appointments.cancelAppointment(appointmentID, db)
        .then(() => res.send('Appointment cancelled successfully.'))
        .catch(e => res.send('Error cancelling appointment, please contact an administrator.'))
})

module.exports = router;