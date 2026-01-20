const BASE_URL = "https://jobtracker-95g2.onrender.com";


const loginForm = document.getElementById("loginForm");
const msg = document.getElementById("authMsg");
const demoSignup = document.getElementById("demoSignup");

function setMsg(text, isError=true){
  msg.style.color = isError ? "#ef4444" : "#10b981";
  msg.innerText = text;
}

demoSignup.addEventListener("click", async (e) => {
  e.preventDefault();

  // demo signup data (you can change)
  const payload = {
    name: "Riya",
    email: "riya@gmail.com",
    password: "123456"
  };

  try{
    const res = await fetch(`${BASE_URL}/api/signup`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if(!res.ok){
      setMsg(data.error || "Signup failed");
      return;
    }

    setMsg("Signup done ✅ Now login using same email & password", false);

  }catch(err){
    setMsg("Backend not reachable. Is Flask running?");
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if(!email || !password){
    setMsg("Enter email and password");
    return;
  }

  try{
    const res = await fetch(`${BASE_URL}/api/login`, {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({email, password})
    });

    const data = await res.json();

    if(!res.ok){
      setMsg(data.error || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    setMsg("Login successful ✅ Redirecting...", false);

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 600);

  }catch(err){
    setMsg("Backend not reachable. Start backend using py app.py");
  }
});
