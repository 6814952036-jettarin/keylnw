const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // ชื่อเกม
    coverImage: { type: String, required: false }, // URL หรือชื่อไฟล์รูปปกเกม
    inputs: [{ type: String }], // ข้อมูลที่ลูกค้าต้องกรอก เช่น ["UID", "Server ID"]
    status: { 
      type: String, 
      default: "active", 
      enum: ["active", "maintenance"] // บังคับให้เป็น 2 ค่านี้เท่านั้น
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("game", gameSchema);