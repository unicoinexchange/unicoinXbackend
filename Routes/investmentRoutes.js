const express = require("express");
const { createInvestment, investmentProtector } = require("../Controllers/investmentController");

const router = express.Router();

router.use(investmentProtector);
router.post("/createInvestment", createInvestment);

module.exports = router;