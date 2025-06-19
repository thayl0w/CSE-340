const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")
const validate = {}

/* **********************************
 * Registration Data Validation Rules
 ********************************** */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Login Data Validation Rules
 ******************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password cannot be empty.")
  ]
}

/* ******************************
 * Password Update Validation Rules
 ******************************* */
validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.")
  ]
}

/* ******************************
 * Check registration data
 ******************************* */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
 * Check login data
 ******************************* */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email
    })
    return
  }
  next()
}

/* ******************************
 * Account Update Validation Rules
 ******************************* */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty().withMessage("First name is required."),
    body("account_lastname")
      .trim()
      .notEmpty().withMessage("Last name is required."),
    body("account_email")
      .trim()
      .isEmail().withMessage("A valid email is required.")
      .custom(async (email, { req }) => {
        const existingAccount = await accountModel.getAccountByEmail(email)
        if (existingAccount && existingAccount.account_id != req.body.account_id) {
          throw new Error("Email already in use.")
        }
      })
  ]
}

/* ******************************
 * Check update account form
 ******************************* */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  let nav = await utilities.getNav()
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const accountData = { account_firstname, account_lastname, account_email, account_id }
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData
    })
    return
  }
  next()
}

/* ******************************
 * Check password update form
 ******************************* */
validate.checkPasswordUpdateData = async (req, res, next) => {
  const { account_password, account_id } = req.body
  let nav = await utilities.getNav()
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData
    })
    return
  }
  next()
}

module.exports = validate