const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// GET /account/register
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Deliver account management view
router.get(
  "/",
  utilities.handleErrors(accountController.buildAccountManagement)
);

module.exports = router;