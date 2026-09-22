const mongoose = require("mongoose");
const crypto = require("crypto");

const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, select: false },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    profile: { type: String, default: "user" },
  },
  { timestamps: true }
);

userSchema.pre("save", function hashNewPassword() {
  if (this.isModified("password")) this.password = hashPassword(this.password);
});

userSchema.methods.comparePassword = function comparePassword(password) {
  const [salt, storedHash] = this.password.split(":");
  const calculatedHash = hashPassword(password, salt).split(":")[1];
  return crypto.timingSafeEqual(
    Buffer.from(storedHash, "hex"),
    Buffer.from(calculatedHash, "hex")
  );
};

module.exports = mongoose.model("user", userSchema);
