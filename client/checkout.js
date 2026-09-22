const API_BASE_URL = "http://localhost:5000/api";
const token = localStorage.getItem("authToken");
const cart = JSON.parse(localStorage.getItem("shoppingCart") || "[]");
const itemsView = document.querySelector("#checkout-items");
const totalView = document.querySelector("#checkout-total");
const statusView = document.querySelector("#checkout-status");
const showStatus = (text, type = "error") => { statusView.textContent = text; statusView.className = `message ${type}`; };
const total = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
if (!token) window.location.replace("./login.html");
if (!cart.length) showStatus("ตะกร้าว่าง กรุณาเลือกสินค้าก่อน");
cart.forEach((item) => { const row = document.createElement("p"); row.textContent = `${item.name} x ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} บาท`; itemsView.append(row); });
totalView.textContent = `${total.toFixed(2)} บาท`;
document.querySelector("#place-order").addEventListener("click", async () => {
  if (!token || !cart.length) return;
  const playerData = document.querySelector("#player-data").value.trim();
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })), playerData: { note: playerData } }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "สร้างคำสั่งซื้อไม่สำเร็จ");
    localStorage.removeItem("shoppingCart");
    showStatus(`สร้างคำสั่งซื้อสำเร็จ เลขที่ ${data.order._id} กำลังไปหน้าชำระเงินจำลอง`, "success");
    window.setTimeout(() => payOrder(data.order._id), 700);
  } catch (error) { showStatus(error.message); }
});
const payOrder = async (id) => {
  const response = await fetch(`${API_BASE_URL}/orders/${id}/pay`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json();
  if (!response.ok) return showStatus(data.message || "ชำระเงินไม่สำเร็จ");
  showStatus(`ชำระเงินจำลองสำเร็จ เลขที่คำสั่งซื้อ ${data.order._id}`, "success");
};