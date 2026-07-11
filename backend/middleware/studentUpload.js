const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const uploadDir = path.join(__dirname, "..", "studentuploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "studentuploads/");
  },

  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(8).toString("hex");
    const extension = path.extname(file.originalname);
    cb(null, randomHex + extension);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("pdf allowed only"), false);
  }
};

const studentUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = studentUpload;
