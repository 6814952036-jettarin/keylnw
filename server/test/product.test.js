const test = require("node:test");
const assert = require("node:assert/strict");
const { validateProductInput } = require("../src/controllers/product.controller");
const { requireAdmin } = require("../src/middlewares/auth.middleware");

test("product input accepts valid values", () => {
  assert.equal(validateProductInput({ gameId: "game-1", name: "110 Diamonds", price: 49, costPrice: 35 }), null);
});

test("product input rejects missing and invalid values", () => {
  assert.equal(validateProductInput({ name: "Missing game", price: 10, costPrice: 5 }), "gameId or gameName, name, price and costPrice are required");
  assert.equal(validateProductInput({ gameId: "game-1", name: "Bad price", price: -1, costPrice: 5 }), "price and costPrice must be non-negative numbers");
  assert.equal(validateProductInput({ gameId: "game-1", name: "Bad status", price: 1, costPrice: 1, status: "disabled" }), "Invalid product status");
});

test("requireAdmin blocks users without admin profile", () => {
  const response = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; } };
  requireAdmin({ user: { profile: "user" } }, response, () => assert.fail("next should not run"));
  assert.equal(response.statusCode, 403);
  assert.deepEqual(response.body, { message: "Admin access required" });
});

test("requireAdmin allows admins", () => {
  let called = false;
  requireAdmin({ user: { profile: "admin" } }, {}, () => { called = true; });
  assert.equal(called, true);
});

test("product promotion accepts valid discount and rejects invalid discount", () => {
  assert.equal(validateProductInput({ gameName: "Free Fire", name: "Promo pack", price: 100, costPrice: 50, stock: 3, promoEnabled: true, discountPercent: 25, promoLabel: "FLASH SALE" }), null);
  assert.equal(validateProductInput({ gameName: "Free Fire", name: "Bad promo", price: 100, costPrice: 50, discountPercent: 101 }), "discountPercent must be between 0 and 100");
});