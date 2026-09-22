const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "game" },
    gameName: { type: String, trim: true },
    name: { type: String, required: true }, // ชื่อแพ็กเกจ เช่น "110 คูปอง", "300 เพชร"
    description: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "", trim: true },
    price: { type: Number, required: true }, // ราคาขายหน้าเว็บ
    costPrice: { type: Number, required: true }, // ราคาต้นทุน (สำหรับคำนวณกำไร)
    stock: { type: Number, default: 0, min: 0 },
    promoEnabled: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    promoLabel: { type: String, default: "", trim: true },
    status: { 
      type: String, 
      default: "available", 
      enum: ["available", "out_of_stock"] 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);