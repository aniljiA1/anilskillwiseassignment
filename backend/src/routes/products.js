const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const controller = require('../controllers/productsController');

// GET /api/products
router.get('/', controller.getAllProducts);

// GET /api/products/search?name=
router.get('/search', controller.searchProducts);

// POST /api/products/import
router.post('/import', upload.single('file'), controller.importCSV);

// GET /api/products/export
router.get('/export', controller.exportCSV);

// GET /api/products/:id/history
router.get('/:id/history', controller.getHistory);

// PUT /api/products/:id
router.put('/:id', controller.updateProduct);

// DELETE /api/products/:id
router.delete('/:id', controller.deleteProduct);

// POST /api/products (optional add new)
router.post('/', controller.addProduct);

module.exports = router;

