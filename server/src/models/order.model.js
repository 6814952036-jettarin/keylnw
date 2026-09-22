const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // ใครเป็นคนซื้อ
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
    items: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 },
    }],
    playerData: { type: Object, default: {} },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "failed"], default: "unpaid" },
    paymentMethod: { type: String, default: "demo" },
    status: { 
      type: String, 
      default: "pending", 
      enum: ["pending", "processing", "completed", "canceled"] 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", orderSchema);