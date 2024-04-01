const express = require("express");
const { getAllUsers, getUser, updateUser, userSignUp, userVerifyOTP, userLogIn, userForgetPassword, userResetPassword, userUpdatePassword, userProtector} = require("../Controllers/userController");

const router = express.Router();

router.post("/userSignUp", userSignUp);
router.post("/userVerifyOTP", userVerifyOTP);
router.post("/userLogIn", userLogIn);
router.post("/userForgetPassword", userForgetPassword);
router.patch("/userResetPassword/:token", userResetPassword);


// FOR ALL PROTECTED ROUTE : USER NEED'S TO BE LOGGED IN
router.use(userProtector);
router.patch("/userUpdatePassword", userUpdatePassword);
router.get("/getAllUsers", getAllUsers);
router.route("/")
      .get(getUser)
      .patch(updateUser);


module.exports = router;