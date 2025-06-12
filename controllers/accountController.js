const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()

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
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    );
  
    if (regResult && !regResult.message) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      );
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      res.status(501).render("account/register", {
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
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    notice: req.flash("notice"),
    loggedin: res.locals.loggedin || 0
  })
}

// GET: Show account update form
async function buildAccountUpdate(req, res, next) {
  let nav = await utilities.getNav();
  let account_id = req.query.account_id || req.body.account_id || (res.locals.accountData && res.locals.accountData.account_id);
  const account = await accountModel.getAccountById(account_id);
  res.render("account/update", {
    title: "Edit Account",
    nav,
    account,
    errors: null,
    message: req.flash("notice")
  });
}

// POST: Update account info
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  const updated = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);
  if (updated && !updated.message) {
    req.flash("notice", "Account information updated successfully.");
    return res.redirect("/account/");
  } else {
    req.flash("notice", "Account update failed.");
    return res.render("account/update", {
      title: "Edit Account",
      nav,
      account: req.body,
      errors: [{ msg: updated.message || "Update failed." }]
    });
  }
}

// POST: Update password
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updated = await accountModel.updatePassword(account_id, hashedPassword);
    if (updated && !updated.message) {
      req.flash("notice", "Password updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Password update failed.");
      const account = await accountModel.getAccountById(account_id);
      return res.render("account/update", {
        title: "Edit Account",
        nav,
        account,
        errors: [{ msg: updated.message || "Password update failed." }]
      });
    }
  } catch (err) {
    req.flash("notice", "Password update failed.");
    const account = await accountModel.getAccountById(account_id);
    return res.render("account/update", {
      title: "Edit Account",
      nav,
      account,
      errors: [{ msg: err.message || "Password update failed." }]
    });
  }
}

// GET: Logout
function logout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildAccountUpdate,
  updateAccount,
  updatePassword,
  logout
}