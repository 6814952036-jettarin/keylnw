const path = require("path");
const { put } = require("@vercel/blob");

const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image file is required" });
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    const extension = path.extname(req.file.originalname).toLowerCase() || ".bin";
    const baseName = path.basename(req.file.originalname, extension).replace(/[^a-zA-Z0-9_-]/g, "-");
    const blob = await put(`products/${Date.now()}-${baseName}${extension}`, req.file.buffer, {
      access: "public",
      contentType: req.file.mimetype,
      addRandomSuffix: true,
    });

    res.status(201).json({ url: blob.url });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadProductImage };
