require("dotenv").config();

const app = require("../server/src/app");
const connectDB = require("../server/src/config/db");

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return res.status(500).json({ message: "Database connection failed" });
  }
};

// Let multer parse multipart/form-data so files can be streamed to Blob.
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
