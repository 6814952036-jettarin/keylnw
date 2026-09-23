require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/product.model");
const valorantProducts = require("../src/data/valorant-products");

const seedValorantProducts = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");

  await mongoose.connect(process.env.MONGO_URI);
  for (const product of valorantProducts) {
    await Product.updateOne(
      { gameName: product.gameName, name: product.name },
      { $set: product },
      { upsert: true }
    );
  }
  console.log(`เพิ่ม/อัปเดตสินค้า Valorant แล้ว ${valorantProducts.length} รายการ`);
};

seedValorantProducts()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });