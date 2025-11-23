// middleware/validate.js

module.exports.validateProduct = (req, res, next) => {
const { name, unit, category, brand, stock, status } = req.body;

// Required fields
if (!name || !unit || !category || !brand || stock === undefined || !status) {
return res.status(400).json({
error: "All fields (name, unit, category, brand, stock, status) are required.",
});
}

// Name length check
if (name.length < 2) {
return res.status(400).json({ error: "Product name must be at least 2 characters long." });
}

// Stock must be a valid number
const numericStock = Number(stock);
if (isNaN(numericStock) || numericStock < 0) {
return res.status(400).json({
error: "Stock must be a valid number greater than or equal to 0.",
});
}

// Status check
const validStatuses = ["In Stock", "Out of Stock"];
if (!validStatuses.includes(status)) {
return res.status(400).json({
error: "Status must be either 'In Stock' or 'Out of Stock'.",
});
}

next();
};

// CSV row validation (for import)
module.exports.validateCSVRow = (row) => {
const errors = [];

if (!row.name) errors.push("Missing name");
if (!row.unit) errors.push("Missing unit");
if (!row.category) errors.push("Missing category");
if (!row.brand) errors.push("Missing brand");

if (row.stock === undefined || isNaN(Number(row.stock)) || Number(row.stock) < 0) {
errors.push("Invalid stock");
}

const validStatuses = ["In Stock", "Out of Stock"];
if (!validStatuses.includes(row.status)) {
errors.push("Invalid status (In Stock / Out of Stock)");
}

return errors;
};

