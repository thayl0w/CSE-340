const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");
const { verifyJWT } = require("../utilities/inventory-auth");

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// GET /account/register
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Account Management
router.get(
  "/management",
  verifyJWT,
  utilities.handleErrors(accountController.buildManagement)
);

// Account Update View
router.get(
  "/update/:account_id",
  verifyJWT,
  utilities.handleErrors(accountController.buildUpdate)
);

// Process Account Update
router.post(
  "/update",
  verifyJWT,
  regValidate.updateRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

// Process Password Update
router.post(
  "/update-password",
  verifyJWT,
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
);

// Logout
router.get("/logout", utilities.handleErrors(accountController.logout));

module.exports = router;