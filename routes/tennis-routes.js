const express = require("express");
const router = express.Router();
const fileUpload = require("../config/cloudinary");

function requireLogin(req, res, next) {
  if (req.session.currentUser) {
    next();
  } else {
    res.status(401).json({ message: "unauthorized" });
  }
}

//Upload image cloudinary
router.post("/upload", fileUpload.single("image"), (req, res) => {
  try {
    res.status(200).json({ fileUrl: req.file.path });
  } catch (e) {
    res.status(500).json({ message: `error occurred ${e}` });
  }
});

module.exports = router;
