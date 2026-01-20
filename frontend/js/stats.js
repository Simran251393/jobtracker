const BASE_URL = "http://127.0.0.1:5000";
const token = localStorage.getItem("token");

const statsMsg = document.getElementById("statsMsg");
const logoutBtn = document.getElementById("logoutBtn");

function setMsg(text, isError=true){
  statsMsg.style.color = isError ? "#ef4444" : "#10b981";
  statsMsg.innerText = text;
}

async function loadStats(){
  if(!token){
    window.location.href = "index.html";
    return;
  }

  try{
    const res = await fetch(`${BASE_URL}/api/jobs/my`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const jobs = await res.json();

    if(!res.ok){
      setMsg(jobs.error || "Failed to load stats");
      return;
    }

    const applied = jobs.filter(j => j.status === "Applied").length;
    const interview = jobs.filter(j => j.status === "Interview").length;
    const offer = jobs.filter(j => j.status === "Offer").length;
    const rejected = jobs.filter(j => j.status === "Rejected").length;

    document.getElementById("appliedCount").innerText = applied;
    document.getElementById("interviewCount").innerText = interview;
    document.getElementById("offerCount").innerText = offer;
    document.getElementById("rejectedCount").innerText = rejected;

    setMsg("Stats updated ✅", false);

  }catch(err){
    setMsg("Backend not reachable. Is Flask running?");
  }
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

loadStats();
