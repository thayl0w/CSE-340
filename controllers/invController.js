const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: req.flash("message"),
  });
};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  let nav = await utilities.getNav();

  if (!data || data.length === 0) {
    return res.status(404).render("errors/error", {
      title: "No Vehicles Found",
      message: "Sorry, we couldn't find any vehicles for that classification.",
      nav,
    });
  }

  const grid = await utilities.buildClassificationGrid(data);
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const inventoryId = req.params.inventoryId;
  let nav = await utilities.getNav();
  const vehicleData = await invModel.getInventoryById(inventoryId);

  if (!vehicleData) {
    return res.status(404).send("Vehicle not found");
  }

  const grid = utilities.buildDetailHtml(vehicleData);
  const title = `${vehicleData.inv_make} ${vehicleData.inv_model}`;

  res.render("./inventory/classification", {
    title,
    nav,
    grid,
  });
};

/* ***************************
 *  Intentional error for testing
 * ************************** */
invCont.causeError = (req, res, next) => {
  try {
    throw new Error("Intentional Server Error for testing");
  } catch (error) {
    next(error);
  }
};

// Task 2 -- week 4
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    messages: req.flash(),
  });
};

invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    const addResult = await invModel.addClassification(classification_name);

    if (!addResult || addResult.rowCount === 0) {
      req.flash("error", "Failed to add classification.");
      return res.redirect("/inv/add-classification");
    }

    req.flash("message", "Classification added successfully.");
    res.redirect("/inv/");  // redirect to inventory management or main page
  } catch (error) {
    next(error);
  }
};

// Task 3 -- Week 4
invCont.buildAddInventory = async (req, res, next) => {
  try {
    const classificationList = await utilities.buildClassificationList();
    const nav = await utilities.getNav();
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      classificationList,
      nav,
      message: req.flash("message"),
      errors: null,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image.png",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
    });
  } catch (error) {
    next(error);
  }
};

// Process add inventory form POST
invCont.addInventory = async (req, res, next) => {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;

    // Validate required fields (simple example)
    const errors = [];
    if (!classification_id) errors.push({ msg: "Classification is required." });
    if (!inv_make) errors.push({ msg: "Make is required." });
    if (!inv_model) errors.push({ msg: "Model is required." });
    if (!inv_year || isNaN(inv_year)) errors.push({ msg: "Valid year is required." });
    if (!inv_price || isNaN(inv_price)) errors.push({ msg: "Valid price is required." });

    if (errors.length > 0) {
      const classificationList = await utilities.buildClassificationList();
      const nav = await utilities.getNav();
      return res.status(400).render("inventory/add-inventory", {
        title: "Add Inventory",
        classificationList,
        nav,
        message: req.flash("message"),
        errors,
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      });
    }

    const addResult = await invModel.addInventoryItem(
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    );

    if (!addResult) {
      req.flash("error", "Failed to add inventory item.");
      return res.redirect("/inv/add-inventory");
    }

    req.flash("message", "Inventory item added successfully.");
    res.redirect("/inv/");
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;