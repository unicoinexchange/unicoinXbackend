const express = require("express");
const { userSignUp, verifyOTP, userLogIn } = require("../Controllers/userController");

const router = express.Router();

router.post("/userSignUp", userSignUp);
router.post("/verifyOtp", verifyOTP);
router.post("/userLogIn", userLogIn);



module.exports = router;