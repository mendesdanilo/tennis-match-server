const express = require("express");
const router = express.Router();
const fileUpload = require("../config/cloudinary");
const User = require("../models/User.model");

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

//Get user by id
router.get("/users/:id", async (req, res) => {
  try {
    const project = await User.findById(req.params.id);
    res.status(200).json(project);
  } catch (e) {
    res.status(500).json({ message: `error occurred ${e}` });
  }
});

router.put("/profile/:id", async (req, res) => {
  try {
    const { name, lastname, imageUrl } = req.body;
    await User.findByIdAndUpdate(req.params.id, {
      name,
      lastname,
      imageUrl,
    });
    res.status(200).json(`id ${req.params.id} was updated`);
  } catch (e) {
    res.status(500).json({ message: `error occurred ${e}` });
  }
});

module.exports = router;
