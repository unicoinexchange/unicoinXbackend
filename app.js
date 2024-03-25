const express = require("express");
const morgan = require("morgan");
const AppError = require("./Utils/appError");
const globalErrorHandler = require("./Controllers/errorController");

const app = express();
app.use(express.json());

// CHECKING FOR CURRENT ENVIROMENT
if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"))
    console.log("My application is currently on", process.env.NODE_ENV);
}

// ENDPOINT ROUTING BY MOUNTING e.g Mounting the router


// HANDLING UNHANDLED ROUTE
app.all("*", (req, res, next) => {
    next(new AppError(`Cant't find ${req.originalUrl} on this server!`, 404))
});

app.use(globalErrorHandler)

module.exports = app;

