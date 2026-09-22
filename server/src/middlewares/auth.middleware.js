const User = require("../models/user.model");
const { verifyToken } = require("../utils/token");

const requireAuth = async (req, res, next) => {
  try {
    const [scheme, token] = (req.headers.authorization || "").split(" ");
    const payload = scheme === "Bearer" ? verifyToken(token) : null;
    if (!payload) return res.status(401).json({ message: "Authentication required" });

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "Authentication required" });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.profile !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };
