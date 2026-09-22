const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5000/api" : "/api";
const loginView = document.querySelector("#auth-view");
const registerView = document.querySelector("#register-view");
const message = document.querySelector("#message");

const setMessage = (text = "", type = "") => {
  message.textContent = text;
  message.className = `message ${type}`;
};

const showView = (view) => {
  loginView.hidden = view !== "login";
  registerView.hidden = view !== "register";
  setMessage();
};

document.querySelector("#show-register").addEventListener("click", () => showView("register"));
document.querySelector("#show-login").addEventListener("click", () => showView("login"));

if (window.location.hash === "#register") showView("register");

const submitAuth = async (event, endpoint) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const submitButton = form.querySelector("button[type=submit]");
  submitButton.disabled = true;
  setMessage("กำลังดำเนินการ...");

  try {
    const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "ไม่สามารถดำเนินการได้");

    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authUser", JSON.stringify(data.user));
    setMessage(`ยินดีต้อนรับ ${data.user.username}! เข้าสู่ระบบสำเร็จ`, "success");
    window.setTimeout(() => {
      window.location.assign("./index.html");
    }, 400);
  } catch (error) {
    setMessage(error.message || "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้", "error");
  } finally {
    submitButton.disabled = false;
  }
};

document.querySelector("#login-form").addEventListener("submit", (event) => submitAuth(event, "login"));
document.querySelector("#register-form").addEventListener("submit", (event) => submitAuth(event, "register"));
