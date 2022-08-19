const jwt = require('jsonwebtoken');
const { Error } = require('mongoose');

module.exports = (req,res,next)=>{
    const head = req.get("Authorization");
    if(!head){
        const error = new Error("Authentication Fails");
        error.statusCode = 401;
        throw error;
    }
    const token = head;
    let decodedToken;

    try{
        decodedToken = jwt.verify(token,"Secret Server Key")
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500
        }
        throw err
    }
    if(!decodedToken){
        const error = new Error("Authentication Failed");
        error.statusCode = 404;
        throw error;
    }
    req.user_id = decodedToken.user_id;
    next();
}