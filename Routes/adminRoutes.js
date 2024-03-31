const express = require("express");
const { adminSignUp, adminVerifyOTP, adminLogin } = require("../Controllers/adminController");

const router = express.Router();

router.post("/adminSignUp", adminSignUp);
router.post("/adminVerifyOTP", adminVerifyOTP);
// router.post("/adminLogin", adminLogin);

module.exports = router;