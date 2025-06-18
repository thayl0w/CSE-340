const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");
const accountModel = require("../models/account-model");

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

// GET: Show account update form
router.get(
  "/update",
  utilities.handleErrors(accountController.buildAccountUpdate)
)

// POST: Process account info update
router.post(
  "/update",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccount)
)

// POST: Process password update
router.post(
  "/update-password",
  regValidate.updatePasswordRules(),
  regValidate.checkUpdatePasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

// GET: Logout
router.get("/logout", utilities.handleErrors(accountController.logout))

// TEMPORARY: Promote a user to Admin or Employee by email
router.get("/promote", async (req, res) => {
  const { email, type } = req.query;
  if (!email || !type || !["Admin", "Employee"].includes(type)) {
    return res.status(400).send("Please provide ?email=...&type=Admin or Employee");
  }
  try {
    const updated = await accountModel.updateAccountTypeByEmail(email, type);
    if (updated && updated.account_email) {
      res.send(`Success! ${email} is now ${type}.`);
    } else {
      res.status(404).send("User not found or update failed.");
    }
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
});

module.exports = router;