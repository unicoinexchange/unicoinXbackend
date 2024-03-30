const express = require("express");
const { createInvestment } = require("../Controllers/investmentController");
const { protect } = require("../Controllers/userController");

const router = express.Router();

router.use(protect);
router.post("/createInvestment", createInvestment);

module.exports = router;