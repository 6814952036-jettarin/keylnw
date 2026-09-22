const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Product = require("../models/product.model");

const getSalePrice = (product) => product.promoEnabled && product.discountPercent > 0
  ? Number((product.price * (1 - product.discountPercent / 100)).toFixed(2))
  : product.price;

const normalizeItems = (body = {}) => {
  if (Array.isArray(body.items)) return body.items;
  if (body.productId) return [{ productId: body.productId, quantity: body.quantity || 1 }];
  return [];
};

const restoreStock = async (reserved) => {
  for (const item of reserved) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }).catch(() => {});
  }
};

const createOrder = async (req, res, next) => {
  const reserved = [];
  try {
    const requestedItems = normalizeItems(req.body)
      .map((item) => ({ productId: String(item.productId || ""), quantity: Number(item.quantity) }))
      .filter((item) => item.productId);
    if (!requestedItems.length) return res.status(400).json({ message: "Cart is empty" });
    if (requestedItems.some((item) => !mongoose.isValidObjectId(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1)) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    const mergedItems = new Map();
    requestedItems.forEach((item) => mergedItems.set(item.productId, (mergedItems.get(item.productId) || 0) + item.quantity));
    const snapshots = [];
    for (const [productId, quantity] of mergedItems) {
      const product = await Product.findOneAndUpdate(
        { _id: productId, status: "available", stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );
      if (!product) {
        await restoreStock(reserved);
        return res.status(409).json({ message: "สินค้าไม่พอหรือไม่พร้อมขาย" });
      }
      reserved.push({ productId, quantity });
      const price = getSalePrice(product);
      snapshots.push({ productId, name: product.name, quantity, price, total: price * quantity });
    }

    const total = snapshots.reduce((sum, item) => sum + item.total, 0);
    const order = await Order.create({
      userId: req.user._id,
      productId: snapshots[0].productId,
      items: snapshots,
      playerData: req.body.playerData || {},
      price: total,
      total,
    });
    res.status(201).json({ order });
  } catch (error) {
    await restoreStock(reserved);
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).populate("items.productId", "name imageUrl").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const payOrder = async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, paymentStatus: "unpaid" },
      { paymentStatus: "paid", status: "processing" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found or already paid" });
    res.json({ message: "ชำระเงินจำลองสำเร็จ", order });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("userId", "username email").populate("items.productId", "name").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const allowed = ["pending", "processing", "completed", "canceled"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid order status" });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, payOrder, getAllOrders, updateOrderStatus };
