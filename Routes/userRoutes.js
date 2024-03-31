const express = require("express");
const { getAllUsers, getUser, updateUser, userSignUp, userVerifyOTP, userLogIn, forgotPassword, resetPassword, updateMyPassword, protect } = require("../Controllers/userController");

const router = express.Router();

router.post("/userSignUp", userSignUp);
router.post("/userVerifyOTP", userVerifyOTP);
router.post("/userLogIn", userLogIn);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);


// FOR ALL PROTECTED ROUTE : USER NEED TO BE LOGIN
router.use(protect);
router.patch("/updateMyPassword", updateMyPassword);
router.get("/getAllUsers", getAllUsers);
router.route("/")
      .get(getUser)
      .patch(updateUser);


module.exports = router;