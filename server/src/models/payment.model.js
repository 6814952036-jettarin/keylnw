const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // ใครเติมเงิน
    amount: { type: Number, required: true }, // จำนวนเงินที่เติม
    method: { type: String, required: true }, // ช่องทาง เช่น "PromptPay", "TrueMoney"
    transactionRef: { type: String, required: false }, // เลขที่อ้างอิงสลิป (ถ้ามี)
    status: { 
      type: String, 
      default: "pending", 
      enum: ["pending", "success", "failed"] 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("payment", paymentSchema);