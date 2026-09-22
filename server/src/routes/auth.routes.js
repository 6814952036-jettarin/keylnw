const express = require("express");
const { register, login, me, getUsers } = require("../controllers/auth.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.get("/admin/users", requireAuth, requireAdmin, getUsers);

module.exports = router;
