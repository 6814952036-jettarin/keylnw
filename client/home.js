const navActions = document.querySelector("#nav-actions");
const storedUser = localStorage.getItem("authUser");
const authToken = localStorage.getItem("authToken");
const cartKey = "shoppingCart";
const cartToggle = document.querySelector("#cart-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const sidebar = document.querySelector(".shop-sidebar");
const checkoutAction = document.querySelector("#checkout-action");
const checkoutMessage = document.querySelector("#checkout-message");
const searchInput = document.querySelector(".shop-search input");
const productDialog = document.querySelector("#product-dialog");
const productDialogContent = document.querySelector("#product-dialog-content");
let catalogProducts = [];
let cart = JSON.parse(localStorage.getItem(cartKey) || "[]");

const saveCart = () => {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  renderCart();
};

const renderCart = () => {
  const cartItems = document.querySelector("#cart-items");
  const cartCount = document.querySelector("#cart-count");
  const cartTotal = document.querySelector("#cart-total");
  if (!cartItems) return;
  cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  cartTotal.textContent = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  cartItems.replaceChildren();
  if (!cart.length) {
    const empty = document.createElement("p");
    empty.className = "empty-cart";
    empty.textContent = "ยังไม่มีสินค้าในตะกร้า";
    cartItems.append(empty);
    return;
  }
  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    const details = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = item.name;
    const price = document.createElement("small");
    price.textContent = `${item.price.toFixed(2)} บาท/ชิ้น`;
    details.append(name, price);
    const controls = document.createElement("div");
    controls.className = "quantity-controls";
    [
      ["−", -1],
      [String(item.quantity), 0],
      ["+", 1],
    ].forEach(([label, change]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = change === 0 ? "quantity-value" : "quantity-button";
      button.textContent = label;
      button.disabled = change === 0;
      button.addEventListener("click", () => {
        item.quantity += change;
        if (item.quantity <= 0) cart = cart.filter((cartItem) => cartItem.id !== item.id);
        saveCart();
      });
      controls.append(button);
    });
    row.append(details, controls);
    cartItems.append(row);
  });
};

const addToCart = (product) => {
  const existing = cart.find((item) => item.id === product._id);
  const stock = Number(product.stock ?? 0);
  if (stock < 1) return;
  if (existing && existing.quantity >= stock) return;
  if (existing) existing.quantity += 1;
  else cart.push({ id: product._id, name: product.name, price: Number(product.salePrice ?? product.price), quantity: 1 });
  saveCart();
  document.querySelector("#cart-panel").hidden = false;
  document.querySelector("#cart-toggle").setAttribute("aria-expanded", "true");
};

const renderCatalog = (products) => {
  const catalog = document.querySelector("#product-catalog");
  catalog.replaceChildren();
  if (!products.length) {
    const empty = document.createElement("p");
    empty.className = "catalog-status";
    empty.textContent = "ยังไม่มีสินค้าที่ตรงกับการค้นหา";
    catalog.append(empty);
    return;
  }
  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "package-card";
    const image = document.createElement("img");
    image.className = "package-image";
    image.src = product.imageUrl || (typeof product.gameId === "object" ? product.gameId.coverImage : "") || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80";
    image.alt = product.name;
    const game = document.createElement("small");
    game.textContent = product.gameName || (typeof product.gameId === "object" ? product.gameId.name : "เติมเกม");
    const name = document.createElement("h3");
    name.textContent = product.name;
    const description = document.createElement("p");
    description.textContent = product.description || "แพ็กเกจเติมเกมราคาพิเศษ";
    const price = document.createElement("strong");
    price.textContent = `${Number(product.salePrice ?? product.price).toFixed(2)} บาท`;
    if (product.promoEnabled && product.discountPercent > 0) {
      card.classList.add("on-promotion");
      const promo = document.createElement("span");
      promo.className = "promo-badge";
      promo.textContent = product.promoLabel || `ลด ${product.discountPercent}%`;
      const originalPrice = document.createElement("del");
      originalPrice.textContent = `${Number(product.price).toFixed(2)} บาท`;
      card.append(promo, originalPrice);
    }
    const stock = document.createElement("span");
    stock.className = "stock-label";
    stock.textContent = Number(product.stock ?? 0) > 0 ? `เหลือ ${product.stock} ชิ้น` : "สินค้าหมด";
    const actions = document.createElement("div");
    actions.className = "package-actions";
    const detailButton = document.createElement("button");
    detailButton.type = "button";
    detailButton.className = "detail-button";
    detailButton.textContent = "ดูรายละเอียด";
    detailButton.addEventListener("click", () => showProductDetail(product));
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = Number(product.stock ?? 0) > 0 ? "เพิ่มลงตะกร้า" : "สินค้าหมด";
    addButton.disabled = Number(product.stock ?? 0) < 1;
    addButton.addEventListener("click", () => addToCart(product));
    actions.append(detailButton, addButton);
    card.append(image, game, name, description, price, stock, actions);
    catalog.append(card);
  });
};

const showProductDetail = (product) => {
  productDialogContent.replaceChildren();
  const title = document.createElement("h2");
  title.textContent = product.name;
  const description = document.createElement("p");
  description.textContent = product.description || "รายละเอียดสินค้าเพิ่มเติมจากร้านค้า";
  const price = document.createElement("strong");
  price.textContent = `${Number(product.salePrice ?? product.price).toFixed(2)} บาท`;
  const stock = document.createElement("p");
  stock.textContent = `สถานะ: ${Number(product.stock ?? 0) > 0 ? `พร้อมขาย เหลือ ${product.stock} ชิ้น` : "สินค้าหมด"}`;
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "เพิ่มลงตะกร้า";
  button.disabled = Number(product.stock ?? 0) < 1;
  button.addEventListener("click", () => { addToCart(product); productDialog.close(); });
  productDialogContent.append(title, description, price, stock, button);
  productDialog.showModal();
};

const loadCatalog = async () => {
  const catalog = document.querySelector("#product-catalog");
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    const products = await response.json();
    if (!response.ok) throw new Error(products.message || "โหลดสินค้าไม่สำเร็จ");
    catalogProducts = products.filter((product) => product.status === "available");
    renderCatalog(catalogProducts);
  } catch (error) {
    catalog.replaceChildren();
    const status = document.createElement("p");
    status.className = "catalog-status";
    status.textContent = error.message;
    catalog.append(status);
  }
};

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  renderCatalog(catalogProducts.filter((product) => `${product.name} ${product.gameName || ""} ${product.description || ""}`.toLowerCase().includes(query)));
});
document.querySelector("#product-dialog-close").addEventListener("click", () => productDialog.close());

cartToggle.addEventListener("click", () => {
  const panel = document.querySelector("#cart-panel");
  panel.hidden = !panel.hidden;
  cartToggle.setAttribute("aria-expanded", String(!panel.hidden));
});
document.querySelector("#cart-close").addEventListener("click", () => {
  document.querySelector("#cart-panel").hidden = true;
  cartToggle.setAttribute("aria-expanded", "false");
});
checkoutAction.addEventListener("click", () => {
  if (!cart.length) {
    checkoutMessage.textContent = "กรุณาเพิ่มสินค้าลงตะกร้าก่อน";
    checkoutMessage.className = "checkout-message warning";
    return;
  }
  if (!localStorage.getItem("authToken")) {
    checkoutMessage.textContent = "ตะกร้าพร้อมแล้ว กรุณาเข้าสู่ระบบเมื่อจะยืนยันคำสั่งซื้อ";
    checkoutMessage.className = "checkout-message warning";
    return;
  }
  window.location.assign("./checkout.html");
});
renderCart();
loadCatalog();

mobileMenu.addEventListener("click", () => {
  sidebar.style.display = sidebar.style.display === "flex" ? "none" : "flex";
});

const showAuthenticatedNav = (user) => {
  try {
    const username = document.createElement("span");
    username.className = "user-greeting";
    username.textContent = `สวัสดี, ${user.username}`;

    const logoutButton = document.createElement("button");
    logoutButton.className = "nav-button nav-logout";
    logoutButton.type = "button";
    logoutButton.textContent = "ออกจากระบบ";
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      window.location.reload();
    });

    const navigation = [username];
    if (user.profile === "admin") {
      const dashboardLink = document.createElement("a");
      dashboardLink.className = "nav-button";
      dashboardLink.href = "./dashboard.html";
      dashboardLink.textContent = "แอดมิน";
      navigation.push(dashboardLink);
    }
    navigation.push(logoutButton, cartToggle);
    navActions.replaceChildren(...navigation);
  } catch {
    localStorage.removeItem("authUser");
  }
};

const showGuestNav = () => {
  navActions.replaceChildren();
  const loginLink = document.createElement("a");
  loginLink.className = "nav-login";
  loginLink.href = "/login.html";
  loginLink.textContent = "เข้าสู่ระบบ";
  const registerLink = document.createElement("a");
  registerLink.className = "nav-button";
  registerLink.href = "/login.html#register";
  registerLink.textContent = "สมัครสมาชิก";
  navActions.append(loginLink, registerLink, cartToggle);
};

const loadAuthenticatedNav = async () => {
  if (!authToken) return;
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Session expired");
    localStorage.setItem("authUser", JSON.stringify(data.user));
    showAuthenticatedNav(data.user);
  } catch {
    // Keep the locally cached user visible; only logout clears the session.
  }
};

if (storedUser) {
  try {
    showAuthenticatedNav(JSON.parse(storedUser));
  } catch {
    localStorage.removeItem("authUser");
  }
}
if (!storedUser && !authToken) showGuestNav();
loadAuthenticatedNav();
