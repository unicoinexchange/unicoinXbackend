const mongoose = require("mongoose");
const dotenv = require("dotenv");

// HANDLING UNCAUGHT EXCEPTION
process.on("uncaughtException", err => {
    console.log("UNCAUGHT EXCEPTION! Shutting down...");
    console.log(err.name, err.message); 
    process.exit(1);
}); 

dotenv.config({ path: "./config.env"});
const app = require("./app");

const DB = process.env.DATABASE

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(con => {
    console.log(con.connections);
    console.log("DB connection successfully");
}).catch(err => {
    console.log(err);
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

// HANDLING UNHANDLED REJECTION
process.on("unhandledRejection", err => {
    console.log("UNHANDLED REJECTION! Shutting down...");
    console.log(err.name, err.massage);
    server.close(() => {
        process.exit(1);
    });
});