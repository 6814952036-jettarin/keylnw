const express = require("express");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");
const { createOrder, getMyOrders, payOrder, getAllOrders, updateOrderStatus } = require("../controllers/order.controller");

const router = express.Router();

router.use(requireAuth);
router.post("/", createOrder);
router.get("/mine", getMyOrders);
router.post("/:id/pay", payOrder);
router.get("/admin/all", requireAdmin, getAllOrders);
router.patch("/admin/:id/status", requireAdmin, updateOrderStatus);

module.exports = router;
