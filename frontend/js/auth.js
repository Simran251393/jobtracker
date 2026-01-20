const BASE_URL = "https://jobtracker-95g2.onrender.com";

const msg = document.getElementById("authMsg");

function setMsg(text, isError = true) {
  if (!msg) return;
  msg.style.color = isError ? "#ef4444" : "#10b981";
  msg.innerText = text;
}

/* ✅ LOGIN */
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      setMsg("Login successful", false);

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);

    } catch (err) {
      setMsg("Backend not reachable");
    }
  });
}

/* ✅ SIGNUP */
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch(`${BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Signup failed");
        return;
      }

      setMsg("Account created. Now login.", false);

      setTimeout(() => {
        window.location.href = "index.html";
      }, 800);

    } catch (err) {
      setMsg("Backend not reachable");
    }
  });
}
