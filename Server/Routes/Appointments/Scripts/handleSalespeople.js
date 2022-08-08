const getSalespeopleBySpecialty = (specialty, db) => {
    return new Promise(async (resolve, reject) => {
        db.all(`
            SELECT salespersonID AS ID, name AS Salesperson, specialtyCompanyCategory AS Specialty FROM Salespeople
            INNER JOIN Users ON Users.userID = Salespeople.salespersonID
            WHERE Specialty = ?  
        `, [specialty], (err, result) => {
            if(err){
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

exports.getSalespeopleBySpecialty = getSalespeopleBySpecialty;