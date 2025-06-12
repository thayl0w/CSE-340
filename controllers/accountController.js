const accountModel = require("../models/account-model")
const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  const message = req.flash("message")
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    message: message.length ? message[0] : null
  })
}

/* ****************************************
*  Process login request
* *************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  try {
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
    const match = await bcrypt.compare(account_password, accountData.account_password)
    if (match) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      const remember = req.body.remember === 'on'
      const cookieOptions = {
        httpOnly: true,
        maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 3600 * 1000 // 30 days or 1 hour
      }
      res.cookie("jwt", accessToken, cookieOptions)
      return res.redirect("/account/management")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    req.flash("notice", "An error occurred during login.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
    if (regResult && regResult.rows && regResult.rows.length > 0) {
      req.flash("message", `Congratulations, you're registered ${account_firstname}. Please log in.`)
      return res.redirect("/account/login")
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      return res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
      })
    }
  } catch (error) {
    console.error("Registration error:", error)
    req.flash("notice", "Sorry, there was an error processing the registration.")
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(req.user.account_id)
  const message = req.flash("message")
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    account: accountData,
    message: message.length ? message[0] : null
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildUpdate(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(req.params.account_id)
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account: accountData,
  })
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (updateResult) {
    req.flash("message", "Congratulations, your information has been updated.")
    res.redirect("/account/management")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account: {
        account_id,
        account_firstname,
        account_lastname,
        account_email,
      },
    })
  }
}

/* ****************************************
*  Process password update
* *************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the password update.')
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account: { account_id },
    })
    return
  }

  const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

  if (updateResult) {
    req.flash("message", "Congratulations, your information has been updated.")
    res.redirect("/account/management")
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account: { account_id },
    })
  }
}

/* ****************************************
*  Process logout
* *************************************** */
async function logout(req, res) {
  res.clearCookie("jwt")
  res.redirect("/")
}

module.exports = {
  buildLogin,
  accountLogin,
  buildRegister,
  registerAccount,
  buildManagement,
  buildUpdate,
  updateAccount,
  updatePassword,
  logout
}