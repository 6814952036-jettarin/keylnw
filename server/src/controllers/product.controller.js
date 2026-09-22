const Product = require("../models/product.model");
const Game = require("../models/game.model");

const allowedStatuses = ["available", "out_of_stock"];

const salePrice = (product) => product.promoEnabled && product.discountPercent > 0
  ? Number((product.price * (1 - product.discountPercent / 100)).toFixed(2))
  : product.price;

const publicProduct = (product, includeCost = false) => {
  const data = { ...product.toObject(), salePrice: salePrice(product) };
  if (!includeCost) delete data.costPrice;
  return data;
};

const validateProductInput = (body = {}) => {
  const { gameId, gameName, name, price, costPrice, stock = 0, discountPercent = 0, promoEnabled = false, status = "available" } = body;
  if ((!gameId && !gameName) || !name || price === undefined || costPrice === undefined) {
    return "gameId or gameName, name, price and costPrice are required";
  }
  if (!Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isFinite(Number(costPrice)) || Number(costPrice) < 0) {
    return "price and costPrice must be non-negative numbers";
  }
  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) return "stock must be a non-negative integer";
  if (!Number.isFinite(Number(discountPercent)) || Number(discountPercent) < 0 || Number(discountPercent) > 100) return "discountPercent must be between 0 and 100";
  if (!allowedStatuses.includes(status)) return "Invalid product status";
  return null;
};

const productFields = (body) => ({
  ...(body.gameId ? { gameId: body.gameId } : {}),
  gameName: (body.gameName || "").trim(),
  name: body.name.trim(),
  description: (body.description || "").trim(),
  imageUrl: (body.imageUrl || "").trim(),
  price: Number(body.price),
  costPrice: Number(body.costPrice),
  stock: Number(body.stock || 0),
  promoEnabled: body.promoEnabled === true || body.promoEnabled === "true",
  discountPercent: Number(body.discountPercent || 0),
  promoLabel: (body.promoLabel || "").trim(),
  status: body.status || "available",
});

const ensureGameExists = async (gameId) => {
  if (!gameId) return true;
  const game = await Game.findById(gameId);
  return Boolean(game);
};

const getProducts = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.search) filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { gameName: { $regex: req.query.search, $options: "i" } },
    ];
    const products = await Product.find(filter).populate("gameId", "name").sort({ createdAt: -1 });
    res.json(products.map(publicProduct));
  } catch (error) {
    next(error);
  }
};

const getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate("gameId", "name").sort({ createdAt: -1 });
    res.json(products.map((product) => publicProduct(product, true)));
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("gameId", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(publicProduct(product));
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const validationError = validateProductInput(req.body);
    if (validationError) return res.status(400).json({ message: validationError });
    if (!(await ensureGameExists(req.body.gameId))) return res.status(400).json({ message: "Game not found" });
    const product = await Product.create(productFields(req.body));
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const validationError = validateProductInput(req.body);
    if (validationError) return res.status(400).json({ message: validationError });
    if (!(await ensureGameExists(req.body.gameId))) return res.status(400).json({ message: "Game not found" });
    const product = await Product.findByIdAndUpdate(req.params.id, productFields(req.body), { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getAdminProducts, getProduct, createProduct, updateProduct, deleteProduct, validateProductInput, salePrice };