const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();

// storage configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Images will be saved in an 'uploads' folder
  },
  filename(req, file, cb) {
    // Rename file to: fieldname-date.extension (e.g., image-12345678.jpg)
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Check file type (only images allowed)
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// The Route
router.post('/', upload.single('image'), (req, res) => {
  res.send(`/${req.file.path.replace(/\\/g, "/")}`); // Return the path
});

module.exports = router;