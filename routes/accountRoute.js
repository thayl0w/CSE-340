const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const invController = require("../controllers/invController");
const accValidate = require('../utilities/account-validation');

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// GET /account/register
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  "/register",
  accValidate.registrationRules(),
  accValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
  "/login",
  accValidate.loginRules(),
  accValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Deliver account management view
router.get(
  "/", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Logout route
router.get(
  "/logout",
  utilities.handleErrors(accountController.logout)
);

// Route to build edit account form
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateForm)
);

// POST: Update Account Info
router.post(
  "/update",
  accValidate.updateAccountRules(), // ✅ validation for name/email
  accValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

// POST: Change Password
router.post(
  "/update-password",
  // accValidate.passwordRules() — 🔴 this is missing from your file, so it's commented out for now
  accValidate.checkPasswordUpdateData,
  utilities.handleErrors(accountController.updatePassword)
);

module.exports = router;