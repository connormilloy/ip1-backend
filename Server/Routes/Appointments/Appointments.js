const express = require('express');
const router = express.Router();
const security = require('../../Utilities/Security');

const appointments = require('./Scripts/handleAppointments');
const salespeople = require('./Scripts/handleSalespeople');

const { getUserAccountLevel } = require('../Accounts/Scripts/handleAccounts');

router.post('/create-new-appointment', [security.validateSessionToken, security.extendToken], (req, res) => {
    const db = req.app.get('db');
    const appointmentData = req.body;

    console.log(appointmentData)

    appointments.createNewAppointment(appointmentData, db)
        .then(() => res.send('Created new appointment.'))
        .catch(e => res.send(e))
})

router.get('/get-appointments-for-salesperson/:salespersonID', (req, res) => {
    const db = req.app.get('db');


})

router.get('/get-appointments/:userID', security.validateSessionToken, (req, res) => {
    const db = req.app.get('db');

    getUserAccountLevel(req.params.userID, db)
        .then(account => {
            if(account?.accountLevel === 1){
                appointments.getAllAppointmentsForUser(req.params.userID, db)
                    .then(response => {
                        appointments.assignAppointmentStatuses(response)
                            .then(response => { res.send(response) });
                    })
                    .catch(e => res.send(e))
            } else if(account?.accountLevel === 2){
                appointments.getAllAppointmentsForSalesperson(req.params.userID, db)
                    .then(response => {
                        appointments.assignAppointmentStatuses(response)
                            .then(response => { res.send(response) });
                    })
                    .catch(e => res.send(e))
            } else {
                res.send([]);
            }
        })
        .catch(e => res.send(e))

})

router.get('/get-salespeople-by-specialty/:specialty', security.validateSessionToken, (req, res) => {
    const db = req.app.get('db');

    salespeople.getSalespeopleBySpecialty(req.params.specialty, db)
        .then(result => {
            console.log(result);
            res.send(result)
        })
        .catch(e => res.send(e))
})

module.exports = router;