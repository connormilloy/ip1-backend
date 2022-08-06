const moment = require('moment-timezone');

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
            SELECT a.name AS User, b.name AS Salesperson, appointmentDateTime AS Appointment FROM Appointments
            INNER JOIN Users a on a.userID = Appointments.userID
            INNER JOIN Users b on b.userID = Appointments.userID
            WHERE salespersonID = ?
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
            SELECT a.name AS User, b.name AS Salesperson, appointmentDateTime AS Appointment FROM Appointments
            INNER JOIN Users a on a.userID = Appointments.userID
            INNER JOIN Users b on b.userID = Appointments.userID
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

exports.createNewAppointment = createNewAppointment;
exports.getAllAppointmentsForSalesperson = getAllAppointmentsForSalesperson;
exports.getAllAppointmentsForUser = getAllAppointmentsForUser;