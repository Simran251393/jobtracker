const BASE_URL = "https://jobtracker-95g2.onrender.com";
const token = localStorage.getItem("token");

const resumeMsg = document.getElementById("resumeMsg");
const uploadBtn = document.getElementById("uploadBtn");
const viewBtn = document.getElementById("viewBtn");
const logoutBtn = document.getElementById("logoutBtn");
const resumeFile = document.getElementById("resumeFile");

function setMsg(text, isError = true) {
  resumeMsg.style.color = isError ? "#ef4444" : "#10b981";
  resumeMsg.innerText = text;
}

if (!token) {
  window.location.href = "index.html";
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

uploadBtn.addEventListener("click", async () => {
  if (!resumeFile.files.length) {
    setMsg("Please select a PDF file first");
    return;
  }

  const file = resumeFile.files[0];
  const formData = new FormData();
  formData.append("resume", file);

  try {
    const res = await fetch(`${BASE_URL}/api/resume/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error || "Upload failed");
      return;
    }

    setMsg("Resume uploaded ✅", false);
  } catch (err) {
    setMsg("Backend not reachable. Is Flask running?");
  }
});

viewBtn.addEventListener("click", async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/resume/view`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const data = await res.json();
      setMsg(data.error || "Unable to view resume");
      return;
    }

    const blob = await res.blob();
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL, "_blank");
  } catch (err) {
    setMsg("Backend not reachable. Is Flask running?");
  }
});
