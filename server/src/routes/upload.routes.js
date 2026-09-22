const express = require("express");
const multer = require("multer");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");
const { uploadProductImage } = require("../controllers/upload.controller");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

router.post("/image", requireAuth, requireAdmin, upload.single("file"), uploadProductImage);

module.exports = router;
