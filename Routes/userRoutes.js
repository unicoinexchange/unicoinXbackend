const express = require("express");
const { userSignUp, verifyOTP } = require("../Controllers/authController");

const router = express.Router();

router.post("/userSignUp", userSignUp);
router.post("/verifyOtp", verifyOTP);



module.exports = router;