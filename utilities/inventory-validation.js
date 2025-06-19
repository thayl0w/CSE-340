const { body, validationResult } = require("express-validator")
const utilities = require(".")

const validateClassification = [
  body("classification_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Please provide a classification name.")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification must not contain spaces or special characters."),
  
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        messages: req.flash("error", "Classification validation failed."),
        errors: errors.array(),
      })
      return
    }
    next()
  }
]

// Task 3 -- Week 4 -- Add Inventory Validation
const inventoryRules = () => {
  return [
    body("classification_id").notEmpty().withMessage("Classification is required."),
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year")
      .isInt({ min: 1900 })
      .withMessage("Year must be valid."),
    body("inv_description").notEmpty().withMessage("Description is required."),
    body("inv_image").notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").notEmpty().withMessage("Thumbnail path is required."),
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a number."),
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a valid number."),
    body("inv_color").notEmpty().withMessage("Color is required.")
  ]
}

const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let classificationList = await utilities.buildClassificationList(req.body.classification_id)
    return res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      classificationList,
      errors: errors.array(),
      ...req.body
    })
  }
  next()
}

// Alias checkUpdateData to reuse checkInventoryData
const checkUpdateData = checkInventoryData

module.exports = {
  checkClassificationName: validateClassification,
  inventoryRules,
  checkInventoryData,
  checkUpdateData 
}