const moment = require('moment-timezone');

const assignAppointmentStatuses = appointments => {
    return new Promise(async (resolve, reject) => {
        const now = moment().tz('Europe/London').unix();

        for(appointment of appointments){
            const time = moment(appointment.Appointment, "DD-MM-YYYY HH:mm:ss").tz('Europe/London').unix();
            let hasPassed = false;
            if(time-now < 1) hasPassed = true;

            appointment['hasPassed'] = hasPassed;
        }

        resolve(appointments);
    })
}
const createNewAppointment = (appointmentData, db) => {
    return new Promise(async (resolve, reject) => {
        const formattedTime = moment(appointmentData.appointmentDateTime).tz('Europe/London').format("DD-MM-YYYY HH:mm:ss");
        appointmentData.appointmentDateTime = formattedTime;

        const values = [appointmentData.salespersonID, appointmentData.userID, appointmentData.appointmentDateTime];
        db.run('INSERT INTO Appointments(salespersonID, userID, appointmentDateTime) VALUES(?, ?, ?)', values, err => {
            if(err){
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

const getAllAppointmentsForSalesperson = (salespersonID, db) => {
    return new Promise(async (resolve, reject) => {
        const query = 
        `
            SELECT a.name AS User, b.name AS Salesperson, a.companyName AS Company, appointmentDateTime AS Appointment, appointmentID AS ID FROM Appointments
            INNER JOIN Users a on a.userID = Appointments.userID
            INNER JOIN Users b on b.userID = Appointments.salespersonID
            WHERE Appointments.salespersonID = ?
        `

        db.all(query, [salespersonID], (err, result) => {
            if(err){
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

const getAllAppointmentsForUser = (userID, db) => {
    return new Promise(async (resolve, reject) => {
        const query = 
        `
            SELECT a.name AS User, b.name AS Salesperson, a.companyName AS Company, appointmentDateTime AS Appointment, appointmentID AS ID FROM Appointments
            INNER JOIN Users a on a.userID = Appointments.userID
            INNER JOIN Users b on b.userID = Appointments.salespersonID
            WHERE Appointments.userID = ?
        `

        db.all(query, [userID], (err, result) => {
            if(err){
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

const cancelAppointment = (appointmentID, db) => {
    return new Promise(async (resolve, reject) => {
        db.run("DELETE FROM Appointments WHERE appointmentID = ?", [appointmentID], err => {
            if(err){
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

exports.createNewAppointment = createNewAppointment;
exports.getAllAppointmentsForSalesperson = getAllAppointmentsForSalesperson;
exports.getAllAppointmentsForUser = getAllAppointmentsForUser;
exports.assignAppointmentStatuses = assignAppointmentStatuses;
exports.cancelAppointment = cancelAppointment;