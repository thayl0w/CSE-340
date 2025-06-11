const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidation = require("../utilities/inventory-validation")
const invVal = require("../utilities/inventory-validation")

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

// Route to inventory management view (Task 1)
router.get("/", utilities.handleErrors(invController.buildManagement))

// Show form to add classification
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
)

// Handle form submission
router.post(
  "/add-classification",
  invValidation.checkClassificationName,
  utilities.handleErrors(invController.addClassification)
)

// task 3 -- week 4
// Show add inventory form
router.get("/add-inventory", invController.buildAddInventory);

// Handle add inventory form submission
router.post("/add-inventory", invController.addInventory);

module.exports = router