const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const accountController = {}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
}

/* ****************************************
* Deliver register view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);

    console.log("Hashed password before insert:", hashedPassword);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );


    if (regResult && !regResult.message) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      );
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(501).render("account/register", {
        title: "Register",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    req.flash("notice", "An error occurred during registration.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  }
}

  /* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()
  const accountData = res.locals.accountData
  res.render("account/management", {
    title: "Account Management",
    nav,
    notice: req.flash("notice"),
    loggedin: res.locals.loggedin || 0,
    accountData  // Pass accountData to the view
  })
}

/* Process Logout */
async function logout(req, res) {
  res.clearCookie("jwt");
  req.session.destroy(() => {
    res.redirect("/");
  });
}

async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  let nav = await utilities.getNav()

  const updateResult = await accountModel.updateAccountInfo(
    account_id, account_firstname, account_lastname, account_email
  )

  if (updateResult) {
    req.flash("notice", "Account information updated successfully.")
    const accountData = await accountModel.getAccountById(account_id)
    res.locals.accountData = accountData
    res.render("account/management", {
      title: "Account Management",
      nav,
      accountData,
      loggedin: 1
    })
  } else {
    req.flash("notice", "Sorry, the update failed.")
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      accountData
    })
  }
}

async function updatePassword(req, res) {
  const { account_id, account_password } = req.body
  let nav = await utilities.getNav()

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

    if (updateResult) {
      req.flash("notice", "Password updated successfully.")
    } else {
      req.flash("notice", "Password update failed.")
    }

    const accountData = await accountModel.getAccountById(account_id)
    res.locals.accountData = accountData

    res.render("account/management", {
      title: "Account Management",
      nav,
      accountData,
      loggedin: 1
    })
  } catch (error) {
    console.error("Error updating password:", error)
    req.flash("notice", "An error occurred.")
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      accountData
    })
  }
}

async function logout(req, res) {
  res.clearCookie("jwt"); // Clear the token cookie
  return res.redirect("/"); // Redirect to home
}

/* ****************************************
*  Deliver update account form view
* *************************************** */
async function buildUpdateForm(req, res) {
  const account_id = req.params.account_id;
  const nav = await utilities.getNav();

  try {
    const accountData = await accountModel.getAccountById(account_id);

    if (!accountData) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account");
    }

    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      accountData
    });
  } catch (error) {
    console.error("Error loading update form:", error);
    req.flash("notice", "An error occurred loading the update form.");
    res.redirect("/account");
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  logout,
  updateAccount,
  updatePassword,
  buildUpdateForm
}