const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(), // CSV doesn't need disk; use memory
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
module.exports = upload;
