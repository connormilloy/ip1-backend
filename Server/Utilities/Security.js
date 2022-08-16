require('dotenv').config();

const { validateSessionToken } = require('./validateSessionToken');
const { extendTokenLifespan } = require('./extendTokenLifespan');

// Validate administrator privileges for superuser routes
// API Key is stored in .env
exports.validateAdmin = async(req, res, next) => {
    const adminKey = req.get('apiKey');

    if(adminKey === process.env.ADMIN_API_KEY){
        next();
    } else {
        res.sendStatus(401);
    }
}

// Validate a user's session token, check that the one sent in a request matches the one in the DB and is valid
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

// Extend the lifespan of a token after a request is made
exports.extendToken = async (req, res, next) => {
    const db = req.app.get('db');
    const email = req.get('email');

    extendTokenLifespan(email, db)
        .then(() => {
            next();
        })
        .catch(e => res.send(e))
}