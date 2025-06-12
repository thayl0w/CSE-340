const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ***************************
 * Verify JWT token
 * ************************** */
const verifyJWT = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash("notice", "Please log in to access this page.");
    return res.redirect("/account/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    req.flash("notice", "Please log in to access this page.");
    return res.redirect("/account/login");
  }
};

/* ***************************
 * Verify Employee or Admin
 * ************************** */
const verifyEmployeeOrAdmin = (req, res, next) => {
  if (!req.user) {
    req.flash("notice", "Please log in to access this page.");
    return res.redirect("/account/login");
  }

  if (req.user.account_type !== "Employee" && req.user.account_type !== "Admin") {
    req.flash("notice", "You do not have permission to access this page.");
    return res.redirect("/account/management");
  }

  next();
};

module.exports = {
  verifyJWT,
  verifyEmployeeOrAdmin
};