const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ---------------------------------
// Upload Directory
// ---------------------------------
const uploadDir = path.join(__dirname, "..", "uploads");

// Create uploads folder if it does not exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ---------------------------------
// Disk Storage
// Used ONLY when creating a complaint
// ---------------------------------
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname).toLowerCase();
    const fileName = `${file.fieldname}-${uniqueSuffix}${extension}`;

    cb(null, fileName);
  },
});

// ---------------------------------
// Memory Storage
// Used ONLY for ML prediction (provides req.file.buffer)
// ---------------------------------
const memoryStorage = multer.memoryStorage();

// ---------------------------------
// File Filter
// ---------------------------------
const fileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }

  cb(null, true);
};

// ---------------------------------
// Upload Middleware Instances
// ---------------------------------
const uploadDisk = multer({
  storage: diskStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

const uploadMemory = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// ---------------------------------
// Export
// ---------------------------------
module.exports = {
  uploadDisk,
  uploadMemory,
};