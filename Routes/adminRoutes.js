const express = require("express");
const { getAllUsers, getUser, editUserInvestmentDetails, adminSignUp, adminVerifyOTP, adminLogin, adminForgetPassword, adminResetPassword, adminUpdatePassword, updateAdmin, getAllAdmin, getAdmin, adminProtector, activateUserInvestment, deactivateUserInvestment, setUserInvestmentAmount, createContact, deleteUser } = require("../Controllers/adminController");
const { restrictTo } = require("../Controllers/handlerFactory")

const router = express.Router();

router.post("/adminSignUp", adminSignUp);
router.post("/adminVerifyOTP", adminVerifyOTP);
router.post("/adminLogin", adminLogin);
router.post("/adminForgetPassword", adminForgetPassword);
router.patch("/adminResetPassword", adminResetPassword);
router.post("/createContact", createContact);

// FOR ALL PROTECTED ROUTE: ADMIN NEED'S TO BE LOGGED IN
router.use(adminProtector);
router.use(restrictTo("admin"));
router.post("/setUserInvestmentAmount/:id", setUserInvestmentAmount);
router.post("/activateUserInvestment", activateUserInvestment);
router.post("/deactivateUserInvestment", deactivateUserInvestment);
router.patch("/adminUpdatePassword", adminUpdatePassword);
router.patch("/editUserInvestmentDetails/:id", editUserInvestmentDetails);
router.get("/getAllAdmin", getAllAdmin);
router.get("/getAllUsers", getAllUsers);
router.delete("/deleteUser/:id", deleteUser);
router.get("/getUser/:id", getUser);
router.route("/")
      .get(getAdmin)
      .patch(updateAdmin);

module.exports = router;