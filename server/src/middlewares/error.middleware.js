const notFound = (req, res, next) => {
res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "Image must be 4 MB or smaller" });
    }

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({ message: "รูปแบบข้อมูลที่ส่งมาไม่ถูกต้อง" });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    if (err.name === "CastError") {
      return res.status(400).json({ message: `Invalid id: ${err.value}` });
    }
    res.status(500).json({ message: err.message || "Server error" });
};

module.exports = { notFound, errorHandler };