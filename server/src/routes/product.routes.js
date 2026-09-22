const express = require("express");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");
const { getProducts, getAdminProducts, getProduct, createProduct, updateProduct, deleteProduct } = require("../controllers/product.controller");

const router = express.Router();

router.get("/", getProducts);
router.get("/admin/packages", requireAuth, requireAdmin, getAdminProducts);
router.get("/:id", getProduct);

router.use(requireAuth, requireAdmin);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;