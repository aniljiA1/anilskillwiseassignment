const db = require('../db');
const { parse } = require('csv-parse/sync');
const { stringify } = require("csv-stringify/sync");

// ------------------ GET ALL PRODUCTS ------------------
const getAllProducts = (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
  res.json(rows);
};

// ------------------ SEARCH PRODUCTS ------------------
const searchProducts = (req, res) => {
  const q = (req.query.name || '').trim();
  if (!q) return getAllProducts(req, res);

  const rows = db.prepare(`
    SELECT * FROM products
    WHERE LOWER(name) LIKE ?
    ORDER BY id DESC
  `).all(`%${q.toLowerCase()}%`);

  res.json(rows);
};

// ------------------ IMPORT CSV ------------------
const importCSV = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const csvText = req.file.buffer.toString();

  let records;
  try {
    records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid CSV' });
  }

  // Prepared statements
  const insert = db.prepare(`
    INSERT INTO products (name, unit, category, brand, stock, status, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const findByName = db.prepare(`
    SELECT id FROM products WHERE LOWER(name) = ?
  `);

  const added = [];
  const skipped = [];
  const duplicates = [];

  const insertTran = db.transaction((rows) => {
    for (const r of rows) {
      const name = (r.name || '').trim();
      if (!name) { skipped.push(r); continue; }

      const exists = findByName.get(name.toLowerCase());
      if (exists) {
        duplicates.push({ name, existingId: exists.id });
        continue;
      }

      const stock = Number.isFinite(+r.stock) ? parseInt(r.stock, 10) : 0;
      const status = r.status?.trim() || (stock > 0 ? 'In Stock' : 'Out of Stock');

      insert.run(
        name,
        r.unit || '',
        r.category || '',
        r.brand || '',
        stock,
        status,
        r.image || ''
      );

      added.push(name);
    }
  });

  try {
    insertTran(records);
    res.json({ added: added.length, skipped: skipped.length, duplicates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Import failed' });
  }
};

// ------------------ EXPORT CSV ------------------
const exportCSV = (req, res) => {
  const rows = db.prepare('SELECT * FROM products').all();
  const csv = stringify(rows, { header: true });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
  res.send(csv);
};

// ------------------ UPDATE PRODUCT ------------------
const updateProduct = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, unit, category, brand, stock, status, image, changedBy } = req.body;

  if (!name || !unit || !category)
    return res.status(400).json({ error: 'Missing fields' });

  const stockNum = Number(stock);
  if (!Number.isFinite(stockNum) || stockNum < 0)
    return res.status(400).json({ error: 'stock must be number >= 0' });

  const existing = db.prepare(`
    SELECT id FROM products WHERE LOWER(name) = ? AND id != ?
  `).get(name.toLowerCase(), id);

  if (existing)
    return res.status(400).json({ error: 'Product name must be unique' });

  const old = db.prepare('SELECT stock FROM products WHERE id = ?').get(id);
  if (!old) return res.status(404).json({ error: 'Product not found' });

  db.prepare(`
    UPDATE products
    SET name=?, unit=?, category=?, brand=?, stock=?, status=?, image=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(
    name,
    unit,
    category,
    brand || "",
    stockNum,
    status || (stockNum > 0 ? "In Stock" : "Out of Stock"),
    image || "",
    id
  );

  if (old.stock !== stockNum) {
    db.prepare(`
      INSERT INTO inventory_logs (product_id, old_stock, new_stock, changed_by)
      VALUES (?, ?, ?, ?)
    `).run(id, old.stock, stockNum, changedBy || "admin");
  }

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.json(updated);
};

// ------------------ VIEW HISTORY ------------------
const getHistory = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const rows = db.prepare(`
    SELECT id, old_stock, new_stock, changed_by, timestamp
    FROM inventory_logs
    WHERE product_id = ?
    ORDER BY timestamp DESC
  `).all(id);

  res.json(rows);
};

// ------------------ DELETE PRODUCT ------------------
const deleteProduct = (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.json({ ok: true });
};

// ------------------ ADD NEW PRODUCT ------------------
const addProduct = (req, res) => {
  const { name, unit, category, brand, stock, status, image } = req.body;

  if (!name || !unit || !category)
    return res.status(400).json({ error: 'Missing fields' });

  const exists = db.prepare(`
    SELECT id FROM products WHERE LOWER(name) = ?
  `).get(name.toLowerCase());

  if (exists)
    return res.status(400).json({ error: 'Product already exists', existingId: exists.id });

  const stockNum = Number(stock) || 0;

  const info = db.prepare(`
    INSERT INTO products (name, unit, category, brand, stock, status, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    unit,
    category,
    brand || '',
    stockNum,
    status || (stockNum > 0 ? 'In Stock' : 'Out of Stock'),
    image || ''
  );

  const created = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
  res.json(created);
};

module.exports = {
  getAllProducts,
  searchProducts,
  importCSV,
  exportCSV,
  updateProduct,
  getHistory,
  deleteProduct,
  addProduct
};



