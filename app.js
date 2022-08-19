const express = require('express');
const feedRoute = require("./routers/feed");
const authRoute = require("./routers/auth");
const bodyparser = require("body-parser");
const mongoose = require('mongoose');
const { Result } = require('express-validator');

// Create App
const app = express();

// Initial Middleware
app.use(bodyparser.json())
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    req.next();
})

// routes
app.use("/feed", feedRoute)
app.use("/auth", authRoute)


// Error handling middleware
app.use(
    (error,req,res,next)=>{
        console.log(error)
        const status = error.statusCode || 500; // 500 - internal server error
        const msg = error.message || "Something went Wrong";
        const data = error.data
        res.status(status).json(
            {
                error_message : msg,
                error_detail  : data
            }
        )
    }
)


// Connection to DB
const api_key = "mongodb+srv://root:root@cluster0.kq3nyka.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(api_key).
then(res => {
    // Server Startup
    app.listen(8080)
})
.catch(err=>{
    console.log(err)  
})