const express = require("express");
const { getAllUsers, adminSignUp, adminVerifyOTP, adminLogin, adminForgetPassword, adminResetPassword, adminUpdatePassword, updateAdmin, getAllAdmin, getAdmin, adminProtector, activateUserInvestment, deactivateUserInvestment, setUserInvestmentAmount } = require("../Controllers/adminController");
const { restrictTo } = require("../Controllers/handlerFactory")

const router = express.Router();

router.post("/adminSignUp", adminSignUp);
router.post("/adminVerifyOTP", adminVerifyOTP);
router.post("/adminLogin", adminLogin);
router.post("/adminForgetPassword", adminForgetPassword);
router.patch("/adminResetPassword", adminResetPassword);

// FOR ALL PROTECTED ROUTE: ADMIN NEED'S TO BE LOGGED IN
router.use(adminProtector);
router.use(restrictTo("admin"));
router.post("/setUserInvestmentAmount/:id", setUserInvestmentAmount);
router.post("/activateUserInvestment/:id", activateUserInvestment);
router.post("/deactivateUserInvestment/:id", deactivateUserInvestment);
router.patch("/adminUpdatePassword", adminUpdatePassword);
router.get("/getAllAdmin", getAllAdmin);
router.get("/getAllUsers", getAllUsers);
router.route("/")
      .get(getAdmin)
      .patch(updateAdmin);

module.exports = router;