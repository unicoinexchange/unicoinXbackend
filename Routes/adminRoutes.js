const express = require("express");
const { adminSignUp, adminVerifyOTP, adminLogin, adminForgetPassword, adminResetPassword, adminUpdatePassword, updateAdmin, getAllAdmin, getAdmin, adminProtector } = require("../Controllers/adminController");

const router = express.Router();

router.post("/adminSignUp", adminSignUp);
router.post("/adminVerifyOTP", adminVerifyOTP);
router.post("/adminLogin", adminLogin);
router.post("/adminForgetPassword", adminForgetPassword);
router.patch("/adminResetPassword/:token", adminResetPassword);

// FOR ALL PROTECTED ROUTE: ADMIN NEED'S TO BE LOGGED IN
router.use(adminProtector);
router.patch("/adminUpdatePassword", adminUpdatePassword);
router.get("/getAllAdmin", getAllAdmin);
router.route("/")
      .get(getAdmin)
      .patch(updateAdmin);

module.exports = router;