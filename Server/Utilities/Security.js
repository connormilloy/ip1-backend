require('dotenv').config();

exports.validateAdmin = async(req, res, next) => {
    const adminKey = req.get('apiKey');

    if(adminKey === process.env.ADMIN_API_KEY){
        next();
    } else {
        res.sendStatus(401);
    }
}