const { validationResult } = require('express-validator/check')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/User')

module.exports.signup = (req, res, next) => {

    // if Validation Fails => Goes back to error handler Middleware in app.js
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    // Values from request
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.hash(password, 12)
        .then(hashedpass => {
            const user = new User({
                name: name,
                email: email,
                password: hashedpass
            })
            return user.save()
        })
        .then(result => {
            res.status(200).json({
                message: "User Created",
                user_id: result._id
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })

}

module.exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let tempUser;
    User.findOne({ email: email })
        .then(
            user => {
                if (!user) {
                    const err = new Error("User not Found.");
                    err.statusCode = 401;
                    return err;
                }
                tempUser = user;
                return bcrypt.compare(password, user.password);
            }
        )
        .then(isValid => {
            if (!isValid) {
                const err = new Error("User not Authenticated.");
                err.statusCode = 401;
                return err;
            }
            // res.json({message:"authenticate"})
            const token = jwt.sign(
                {   email : tempUser.email,
                    name : tempUser.name.toString(),
                    user_id : tempUser._id.toString()
                },
                "Secret Server Key",
                { expiresIn: '1h' }
            )
            res.json({jwt:token, user : tempUser})
        })
        .catch(err => {
            if (!err.statusCode) err.statusCode = 500;
            next(err);
        })

}

