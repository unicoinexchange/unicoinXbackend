const express = require("express");
const { getAllUsers, getUser, updateUser, userSignUp, verifyOTP, userLogIn, forgotPassword, resetPassword, updateMyPassword, protect } = require("../Controllers/userController");

const router = express.Router();

router.post("/userSignUp", userSignUp);
router.post("/verifyOtp", verifyOTP);
router.post("/userLogIn", userLogIn);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);


// FOR ALL PROTECTED ROUTE : USER NEED TO BE LOGIN
router.use(protect);
router.patch("/updateMyPassword", updateMyPassword);
router.get("/getAllUsers", getAllUsers);
router.route("/:id")
      .get(getUser)
      .patch(updateUser);


module.exports = router;