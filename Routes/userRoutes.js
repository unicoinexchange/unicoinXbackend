const express = require("express");
const { getUser, updateUser, userSignUp, userVerifyOTP, userLogIn, userForgetPassword, userResetPassword, userUpdatePassword, userProtector} = require("../Controllers/userController");
const { restrictTo } = require("../Controllers/handlerFactory");

const router = express.Router();

router.post("/userSignUp", userSignUp);
router.post("/userVerifyOTP", userVerifyOTP);
router.post("/userLogIn", userLogIn); 
router.post("/userForgetPassword", userForgetPassword);
router.patch("/userResetPassword", userResetPassword);


// FOR ALL PROTECTED ROUTE : USER NEED'S TO BE LOGGED IN
router.use(userProtector);
router.use(restrictTo("user"));
router.patch("/userUpdatePassword", userUpdatePassword);
router.route("/")
      .get(getUser)
      .patch(updateUser);


module.exports = router;