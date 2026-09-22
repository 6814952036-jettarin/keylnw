const API_BASE_URL = "http://localhost:5000/api";
const cartKey = "shoppingCart";
const category = new URLSearchParams(window.location.search).get("category") || "games";
const categoryConfig = {
  games: { eyebrow: "GAME TOP UP", title: "เติมเกมราคาพิเศษ", description: "เลือกแพ็กเกจเกมที่ต้องการ แล้วเพิ่มลงตะกร้าได้ทันที" },
  cards: { eyebrow: "TOP UP CARDS", title: "บัตรเติมเงินและบัตรเติมเกม", description: "บัตรดิจิทัลสำหรับเกมและบริการยอดนิยม ส่งข้อมูลหลังชำระเงิน" },
  vouchers: { eyebrow: "GIFT VOUCHER", title: "บัตร Gift Voucher", description: "มอบเป็นของขวัญหรือใช้ซื้อบริการดิจิทัลได้อย่างสะดวก" },
  special: { eyebrow: "SPECIAL ITEMS", title: "ตัวละครและไอเทมสุดพิเศษ", description: "ไอเทมคัดพิเศษสำหรับผู้เล่นที่ต้องการความโดดเด่น" },
  mobile: { eyebrow: "MOBILE TOP UP", title: "เติมเงินมือถือ", description: "บริการเติมเงินมือถือที่รวดเร็ว ใช้งานได้ตลอด 24 ชั่วโมง" },
  privacy: { eyebrow: "PRIVACY POLICY", title: "นโยบายความเป็นส่วนตัว", description: "เราใช้ข้อมูลเท่าที่จำเป็นเพื่อให้บริการและดูแลคำสั่งซื้อของคุณ" },
  returns: { eyebrow: "RETURN POLICY", title: "นโยบายการคืนสินค้า", description: "ตรวจสอบเงื่อนไขการคืนเงินและการช่วยเหลือก่อนสั่งซื้อ" },
};
const config = categoryConfig[category] || categoryConfig.games;
const content = document.querySelector("#service-content");
const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
const setText = (selector, text) => { document.querySelector(selector).textContent = text; };
setText("#service-eyebrow", config.eyebrow);
setText("#service-title", config.title);
setText("#service-description", config.description);
document.querySelector(`[data-category="${category}"]`)?.classList.add("active");

const addToCart = (product) => {
  const items = JSON.parse(localStorage.getItem(cartKey) || "[]");
  const existing = items.find((item) => item.id === product._id);
  if (existing) existing.quantity += 1;
  else items.push({ id: product._id, name: product.name, price: Number(product.salePrice ?? product.price), quantity: 1 });
  localStorage.setItem(cartKey, JSON.stringify(items));
  renderCartAction();
};
const renderCartAction = () => {
  const action = document.querySelector("#service-actions .cart-button");
  const count = JSON.parse(localStorage.getItem(cartKey) || "[]").reduce((sum, item) => sum + item.quantity, 0);
  action.textContent = `ตะกร้า (${count})`;
  action.href = count ? "./index.html#products" : "./index.html#products";
};
const renderProducts = (products) => {
  content.replaceChildren();
  if (!products.length) { content.innerHTML = '<p class="catalog-status">ยังไม่มีสินค้าในหมวดนี้</p>'; return; }
  const grid = document.createElement("div"); grid.className = "service-product-grid";
  products.forEach((product) => {
    const card = document.createElement("article"); card.className = "service-product-card";
    const image = document.createElement("img"); image.src = product.imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80"; image.alt = product.name;
    const game = document.createElement("small"); game.textContent = product.gameName || "ดิจิทัลไอเทม";
    const name = document.createElement("h2"); name.textContent = product.name;
    const price = document.createElement("strong"); price.textContent = `${Number(product.salePrice ?? product.price).toFixed(2)} บาท`;
    const button = document.createElement("button"); button.type = "button"; button.textContent = "เพิ่มลงตะกร้า"; button.disabled = Number(product.stock ?? 0) < 1; button.addEventListener("click", () => addToCart(product));
    card.append(image, game, name, price, button); grid.append(card);
  }); content.append(grid);
};
const renderInfo = () => {
  const items = category === "privacy" ? ["เก็บข้อมูลบัญชีและคำสั่งซื้อเท่าที่จำเป็น", "ไม่เผยแพร่ข้อมูลให้บุคคลภายนอกโดยไม่ได้รับอนุญาต", "ติดต่อทีมงานได้เมื่อพบข้อสงสัยเกี่ยวกับข้อมูลของคุณ"] : ["สินค้าดิจิทัลที่ส่งมอบแล้วไม่สามารถคืนได้", "หากเติมผิดบัญชีหรือข้อมูลไม่ถูกต้อง กรุณาติดต่อทีมงานทันที", "กรณีระบบขัดข้อง ทีมงานจะตรวจสอบและคืนเงินตามหลักฐานการชำระเงิน"];
  content.innerHTML = `<div class="policy-panel"><h2>${category === "privacy" ? "เราให้ความสำคัญกับข้อมูลของคุณ" : "เงื่อนไขการคืนสินค้า"}</h2><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul><a class="primary-link" href="./index.html">กลับหน้าหลัก</a></div>`;
};
const loadProducts = async () => {
  if (["privacy", "returns"].includes(category)) { renderInfo(); return; }
  try { const response = await fetch(`${API_BASE_URL}/products`); const products = await response.json(); if (!response.ok) throw new Error(products.message || "โหลดสินค้าไม่สำเร็จ"); renderProducts(products.filter((product) => product.status === "available")); }
  catch (error) { content.innerHTML = `<p class="catalog-status">${error.message} <a href="./index.html">กลับหน้าหลัก</a></p>`; }
};
document.querySelector(".mobile-menu").addEventListener("click", () => { const sidebar = document.querySelector(".shop-sidebar"); sidebar.classList.toggle("is-open"); });
document.querySelector("#service-search").addEventListener("input", (event) => { const query = event.target.value.toLowerCase(); document.querySelectorAll(".service-product-card").forEach((card) => { card.hidden = !card.textContent.toLowerCase().includes(query); }); });
renderCartAction();
loadProducts();
