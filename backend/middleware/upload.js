const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "photo") {
      cb(null, "uploads/photos/");
    } else if (file.fieldname === "video") {
      cb(null, "uploads/videos/");
    } else if (file.fieldname === "assignment") {
      cb(null, "uploads/assignments/");
    } else {
      cb(null, "uploads/");
    }
  },

  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(8).toString("hex"); //random 8letter string
    const extension = path.extname(file.originalname);
    cb(null, randomHex + extension);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 300 * 1024 * 1024, // abhi ke liye 300mb rkha he
  },
});

module.exports = upload;
