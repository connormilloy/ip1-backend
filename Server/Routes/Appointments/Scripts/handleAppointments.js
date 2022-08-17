const moment = require('moment-timezone');

// Assign 'Completed/Upcoming' statuses to a block of appointments
const assignAppointmentStatuses = appointments => {
    return new Promise(async (resolve, reject) => {
        // Define right now as a unix time
        const now = moment().tz('Europe/London').unix();

        for(appointment of appointments){
            console.log(appointment);
            // Convert the appointment's time to unix time, we will be comparing this to our 'now' variable
            const time = moment(appointment.Appointment, "DD-MM-YYYY HH:mm:ss").tz('Europe/London').unix();
            let hasPassed = false;

            // If the difference in unix time between the appointment time and now is < 1ms, we know the appointment has passed
            if(time-now < 1) hasPassed = true;

            // Add a hasPassed key to the appointment with the correct value
            appointment['hasPassed'] = hasPassed;
            appointment['Appointment'] = moment(appointment.Appointment, "DD-MM-YYYY HH:mm:ss");
        }

        resolve(appointments);
    })
}

// Create a new appointment in the Appointments table
const createNewAppointment = (appointmentData, db) => {
    return new Promise(async (resolve, reject) => {
        // Format the appointment date/time to use DD-MM-YYYY and mutate the appointmentData object to set it
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

// Get all appointments corresponding to a salespersonID from the Appointments table
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

// Get all appointments corresponding to a userID from the Appointments table
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

// Delete an appointment from the Appointments table, by appointmentID
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