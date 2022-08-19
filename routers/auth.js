const exp = require("express")
const {body} = require('express-validator')
const User = require("../models/User")
const authController = require("../controllers/auth")
const router = exp.Router()

// PUT '/auth/signup' -> router.put('Path', <validation Middleware>, <controller>)
router.put("/signup",
// validation middleware
[
    body("email").isEmail().withMessage("Please Enter a valid email.")
    .custom(
        (value,{req})=>{
            return User.findOne({email : value})
                    .then(userDoc=>{
                        if(userDoc) return Promise.reject("E-Mail already exists!")
                })
        }).normalizeEmail(),

    body("password").trim().isLength({min:5}),

    body("name").trim().not().isEmpty()
], 
// controller
    authController.signup );


// POSt '/auth/login' 
router.post("/login",authController.login)

module.exports = router