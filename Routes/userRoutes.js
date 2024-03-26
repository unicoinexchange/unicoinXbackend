const express = require("express");
const { userSignUp, verifyOTP, userLogIn, forgotPassword, resetPassword } = require("../Controllers/userController");

const router = express.Router();

router.post("/userSignUp", userSignUp);
router.post("/verifyOtp", verifyOTP);
router.post("/userLogIn", userLogIn);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);



module.exports = router;