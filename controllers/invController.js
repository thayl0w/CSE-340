const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const inventoryId = req.params.inventoryId
  let nav = await utilities.getNav()
  const vehicleData = await invModel.getInventoryById(inventoryId)

  if (!vehicleData) {
    return res.status(404).send("Vehicle not found")
  }

  const detail = utilities.buildDetailHtml(vehicleData)
  const title = `${vehicleData.inv_make} ${vehicleData.inv_model}`

  res.render("./inventory/detail", {
    title,
    nav,
    detail,
  })
}

/* ***************************
 *  Intentional error for testing
 * ************************** */
invCont.causeError = (req, res, next) => {
  try {
    throw new Error("Intentional Server Error for testing")
  } catch (error) {
    next(error)
  }
}

module.exports = invCont