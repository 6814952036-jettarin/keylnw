const User = require("../models/user.model");
const { createToken } = require("../utils/token");

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  profile: user.profile,
});

const respondWithToken = (res, user, status = 200) =>
  res.status(status).json({ token: createToken({ sub: user._id.toString() }), user: publicUser(user) });

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (exists) return res.status(409).json({ message: "Username or email is already in use" });

    const user = await User.create({ username, email, password });
    respondWithToken(res, user, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { identifier, username, password } = req.body;
    const loginIdentifier = (identifier || username || "").trim();
    if (!loginIdentifier || !password) return res.status(400).json({ message: "Email/username and password are required" });

    const user = await User.findOne({
      $or: [{ username: loginIdentifier }, { email: loginIdentifier.toLowerCase() }],
    }).select("+password");
    if (!user || !user.comparePassword(password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    respondWithToken(res, user);
  } catch (error) {
    next(error);
  }
};

const me = (req, res) => res.json({ user: publicUser(req.user) });

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("username email profile createdAt").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, me, getUsers };
