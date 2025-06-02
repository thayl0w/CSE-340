const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// Route to build vehicle detail view
router.get(
  "/detail/:inventoryId",
  utilities.handleErrors(invController.buildDetailView)
)

// Intentional error route using controller function
router.get("/cause-error", utilities.handleErrors(invController.causeError))

module.exports = router