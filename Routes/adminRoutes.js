const express = require("express");
const { adminSignUp, verifyOTP, adminLogin } = require("../Controllers/adminController");

const router = express.Router();

router.post("/adminSignUp", adminSignUp);
router.post("/verifyOTP", verifyOTP);
// router.post("/adminLogin", adminLogin);

module.exports = router;