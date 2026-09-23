require("dotenv").config();

const app = require("../server/src/app");
const connectDB = require("../server/src/config/db");

module.exports = async (req, res) => {
  if (req.url === "/api/health" || req.url === "/health") {
    return res.status(200).json({
      status: "ok",
      databaseConfigured: Boolean(process.env.MONGO_URI),
      blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    });
  }

  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("MongoDB connection failed:", {
      name: error.name,
      code: error.code,
      message: error.message,
    });
    const errorText = `${error.name || ""} ${error.code || ""} ${error.message || ""}`;
    const reason = /Authentication failed|bad auth|8000|Unauthorized/i.test(errorText)
      ? "MongoDB credentials are invalid"
      : /querySrv|ENOTFOUND|MongoParseError|Invalid scheme/i.test(errorText)
        ? "MongoDB cluster address is invalid"
        : /ServerSelection|Server selection|timed out|ECONNREFUSED|network/i.test(errorText)
          ? "MongoDB Atlas rejected the connection or is not allowing this network"
          : error.message === "MONGO_URI is required"
            ? "MONGO_URI is not configured in Vercel"
            : "MongoDB connection failed: check Vercel Runtime Logs";
    return res.status(500).json({ message: reason });
  }
};

// Let multer parse multipart/form-data so files can be streamed to Blob.
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
