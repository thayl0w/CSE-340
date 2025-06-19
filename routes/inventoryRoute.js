const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidation = require("../utilities/inventory-validation")
// const invVal = require("../utilities/inventory-validation")
const invCont = require("../controllers/invController");

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
router.get(
  "/",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildManagement)
)

// Return inventory data as JSON
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// Show form to add classification
router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddClassification)
)

// Handle form submission
router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAccountType,
  invValidation.checkClassificationName,
  utilities.handleErrors(invController.addClassification)
)

// task 3 -- week 4
// Show add inventory form
router.get(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddInventory)
)

// Handle add inventory form submission
router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.addInventory)
)

// Show edit inventory form
router.get(
  "/edit/:inv_id",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildEditInventory)
)

// Handle inventory update form submission (NEW)
router.post(
  "/update",
  utilities.checkLogin,
  utilities.checkAccountType,
  invValidation.inventoryRules(),
  invValidation.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

router.get("/delete/:inv_id", invController.buildDeleteInventory);
router.post("/delete", invController.deleteInventory);

router.get("/manage-classification", invCont.buildManageClassifications);
router.post("/update-classification", invCont.updateClassification);
router.post("/delete-classification", invCont.deleteClassification);

module.exports = router