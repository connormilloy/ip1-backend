require('dotenv').config();

const { validateSessionToken } = require('./validateSessionToken');
const { extendTokenLifespan } = require('./extendTokenLifespan');

exports.validateAdmin = async(req, res, next) => {
    const adminKey = req.get('apiKey');

    if(adminKey === process.env.ADMIN_API_KEY){
        next();
    } else {
        res.sendStatus(401);
    }
}

exports.validateSessionToken = async(req, res, next) => {
    const db = req.app.get('db');
    const email = req.get('email');
    const token = req.get('token');

    validateSessionToken(email, token, db)
        .then(valid => {
            if(valid){
                next();
            } else {
                res.sendStatus(401);
            }
        })
}

exports.extendToken = async (req, res, next) => {
    const db = req.app.get('db');
    const email = req.get('email');

    extendTokenLifespan(email, db)
        .then(() => {
            next();
        })
        .catch(e => res.send(e))
}