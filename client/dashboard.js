const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5000/api" : "/api";
const token = localStorage.getItem("authToken");
const message = document.querySelector("#message");
const adminPanel = document.querySelector("#product-admin");
const productForm = document.querySelector("#product-form");
const productList = document.querySelector("#product-list");
const cancelProduct = document.querySelector("#cancel-product");
const orderList = document.querySelector("#order-list");
const userList = document.querySelector("#user-list");
const newPackageButton = document.querySelector("#new-package");
const packageSearch = document.querySelector("#package-search");
const packageStatusFilter = document.querySelector("#package-status-filter");
let adminProducts = [];

const redirectToLogin = () => window.location.replace("./login.html");

const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.message || "ไม่สามารถดำเนินการได้");
  return data;
};

const uploadProductImage = async (file) => {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "อัปโหลดรูปไม่สำเร็จ");
  return data.url;
};

const resetProductForm = () => {
  productForm.reset();
  document.querySelector("#product-id").value = "";
  cancelProduct.hidden = true;
};

const renderProducts = (products) => {
  productList.replaceChildren();
  if (!products.length) {
    productList.innerHTML = "<p class=\"empty-state\">ยังไม่มีสินค้า</p>";
    return;
  }
  products.forEach((product) => {
    const item = document.createElement("article");
    item.className = "product-item";
    const gameName = product.gameName || (typeof product.gameId === "object" ? product.gameId.name : product.gameId);
    const details = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = product.name;
    const summary = document.createElement("small");
    summary.textContent = `${gameName} · ราคาขาย ${product.price} บาท${product.promoEnabled ? ` · โปร ${product.discountPercent}% = ${product.salePrice} บาท` : ""} · ทุน ${product.costPrice} บาท`;
    const status = document.createElement("span");
    status.className = `status ${product.status}`;
    status.textContent = product.status === "available" ? "พร้อมขาย" : "สินค้าหมด";
    details.append(name, summary, status);
    const actions = document.createElement("div");
    actions.className = "product-actions";
    const editButton = document.createElement("button");
    editButton.className = "small-button";
    editButton.type = "button";
    editButton.textContent = "แก้ไข";
    editButton.addEventListener("click", () => {
      document.querySelector("#product-id").value = product._id;
      document.querySelector("#product-game-name").value = product.gameName || (typeof product.gameId === "object" ? product.gameId.name : "");
      document.querySelector("#product-name").value = product.name;
      document.querySelector("#product-price").value = product.price;
      document.querySelector("#product-cost").value = product.costPrice;
      document.querySelector("#product-status").value = product.status;
      document.querySelector("#product-stock").value = product.stock || 0;
      document.querySelector("#product-image-url").value = product.imageUrl || "";
      document.querySelector("#product-description").value = product.description || "";
      document.querySelector("#product-promo-enabled").checked = Boolean(product.promoEnabled);
      document.querySelector("#product-discount").value = product.discountPercent || 0;
      document.querySelector("#product-promo-label").value = product.promoLabel || "";
      cancelProduct.hidden = false;
      productForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const promoButton = document.createElement("button");
    promoButton.className = "small-button promo-button";
    promoButton.type = "button";
    promoButton.textContent = "แก้ไขโปรโมชั่น";
    promoButton.addEventListener("click", () => {
      editButton.click();
      document.querySelector("#product-promo-enabled").focus();
    });
    const deleteButton = document.createElement("button");
    deleteButton.className = "small-button danger-button";
    deleteButton.type = "button";
    deleteButton.textContent = "ลบ";
    deleteButton.addEventListener("click", async () => {
      if (!window.confirm(`ยืนยันการลบ ${product.name} หรือไม่`)) return;
      try {
        await apiRequest(`/products/${product._id}`, { method: "DELETE" });
        await loadProducts();
        message.textContent = "ลบสินค้าแล้ว";
        message.className = "message success";
      } catch (error) {
        message.textContent = error.message;
        message.className = "message error";
      }
    });
    actions.append(editButton, promoButton, deleteButton);
    item.append(details, actions);
    productList.append(item);
  });
};

const loadProducts = async () => {
  adminProducts = await apiRequest("/products/admin/packages");
  filterProducts();
};

const filterProducts = () => {
  const query = packageSearch.value.trim().toLowerCase();
  const status = packageStatusFilter.value;
  renderProducts(adminProducts.filter((product) => {
    const gameName = product.gameName || product.gameId?.name || "";
    const matchesQuery = `${product.name} ${gameName}`.toLowerCase().includes(query);
    return matchesQuery && (status === "all" || product.status === status);
  }));
};

const loadAdminData = async () => {
  const [orders, users] = await Promise.all([apiRequest("/orders/admin/all"), apiRequest("/auth/admin/users")]);
  orderList.replaceChildren();
  userList.replaceChildren();
  orders.forEach((order) => {
    const item = document.createElement("p");
    item.textContent = `#${order._id.slice(-6)} · ${order.userId?.username || "ผู้ใช้"} · ${order.total || order.price} บาท · ${order.status}`;
    orderList.append(item);
  });
  users.forEach((user) => {
    const item = document.createElement("p");
    item.textContent = `${user.username} · ${user.email} · ${user.profile}`;
    userList.append(item);
  });
};

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!productForm.reportValidity()) return;
  const formData = Object.fromEntries(new FormData(productForm));
  const productId = formData.id;
  const imageFile = formData.imageFile;
  delete formData.id;
  delete formData.imageFile;
  try {
    if (imageFile?.size) formData.imageUrl = await uploadProductImage(imageFile);
    await apiRequest(productId ? `/products/${productId}` : "/products", {
      method: productId ? "PUT" : "POST",
      body: JSON.stringify(formData),
    });
    resetProductForm();
    await loadProducts();
    message.textContent = productId ? "แก้ไขสินค้าแล้ว" : "เพิ่มสินค้าแล้ว";
    message.className = "message success";
  } catch (error) {
    message.textContent = error.message;
    message.className = "message error";
  }
});

cancelProduct.addEventListener("click", resetProductForm);
newPackageButton.addEventListener("click", () => {
  resetProductForm();
  document.querySelector("#product-game-name").focus();
  productForm.scrollIntoView({ behavior: "smooth", block: "start" });
});
packageSearch.addEventListener("input", filterProducts);
packageStatusFilter.addEventListener("change", filterProducts);

const loadProfile = async () => {
  if (!token) return redirectToLogin();

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    document.querySelector("#username").textContent = data.user.username;
    document.querySelector("#email").textContent = data.user.email;
    document.querySelector("#profile").textContent = data.user.profile;
    if (data.user.profile !== "admin") return window.location.replace("./index.html");
    adminPanel.hidden = false;
    await Promise.all([loadProducts(), loadAdminData()]);
  } catch (error) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    message.textContent = "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่";
    window.setTimeout(redirectToLogin, 1200);
  }
};

document.querySelector("#logout").addEventListener("click", () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  redirectToLogin();
});

loadProfile();
