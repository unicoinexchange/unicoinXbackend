const express = require("express");
const morgan = require("morgan");
const AppError = require("./Utils/appError");
const globalErrorHandler = require("./Controllers/errorController");
const adminRouter = require("./Routes/adminRoutes");
const userRouter = require("./Routes/userRoutes");
const investmentRouter = require("./Routes/investmentRoutes");
const cors = require("cors");

const app = express();
app.use(express.json());

// IMPLEMENT CORS
app.use(cors());
app.options("*", cors());


// CHECKING FOR CURRENT ENVIROMENT
if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"))
    console.log("My application is currently on", process.env.NODE_ENV);
}

// ENDPOINT ROUTING BY MOUNTING e.g Mounting the router
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/investment", investmentRouter);

// HANDLING UNHANDLED ROUTE
app.all("*", (req, res, next) => {
    next(new AppError(`Cant't find ${req.originalUrl} on this server!`, 404))
});

app.use(globalErrorHandler);

module.exports = app;

