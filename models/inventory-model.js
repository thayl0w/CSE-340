const pool = require("../database/")
const invModel = require("../models/inventory-model")

async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error)
    return null
  }
}

async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryById error: " + error)
    throw error
  }
}

// task 2 -- week 4
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    const result = await pool.query(sql, [classification_name])
    return result.rows[0]
  } catch (error) {
    console.error("addClassification error: " + error)
    return null
  }
}

// task 3 -- week 4
async function addInventoryItem(
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
) {
  try {
    const sql = `
      INSERT INTO inventory
        (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;

    const values = [
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
    ];

    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("addInventoryItem error:", error);
    return false;
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

async function deleteInventoryItem(inv_id) {
  try {
    const data = await pool.query(
      "DELETE FROM inventory WHERE inv_id = $1",
      [inv_id]
    );
    return data;
  } catch (error) {
    console.error("deleteInventoryItem error:", error);
    throw error;
  }
}

async function buildManageClassifications(req, res) {
  const nav = await utilities.getNav();
  const classifications = await invModel.getClassifications();
  res.render("inventory/manage-classification", {
    title: "Manage Classifications",
    nav,
    classifications
  });
}

// Get all classifications
async function getAllClassifications() {
  return await pool.query("SELECT * FROM classification ORDER BY classification_name");
}

// Update a classification
async function updateClassification(id, newName) {
  return await pool.query(
    "UPDATE classification SET classification_name = $1 WHERE classification_id = $2",
    [newName, id]
  );
}

// Delete a classification
async function deleteClassification(id) {
  return await pool.query(
    "DELETE FROM classification WHERE classification_id = $1",
    [id]
  );
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  addInventoryItem,
  updateInventory,
  deleteInventoryItem,
  getAllClassifications,
  updateClassification,
  deleteClassification,
  buildManageClassifications
}