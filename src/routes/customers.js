const express = require("express");
const router = express.Router();
const CustomerController = require("../apps/controllers/api/customer");

router.get("/", CustomerController.getCustomers);
router.post("/register", CustomerController.registerCustomer);
router.post("/login", CustomerController.loginCustomer);

module.exports = router;
