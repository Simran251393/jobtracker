const BASE_URL = "https://jobtracker-95g2.onrender.com";

const token = localStorage.getItem("token");

const jobsGrid = document.getElementById("jobsGrid");
const dashMsg = document.getElementById("dashMsg");

const addJobBtn = document.getElementById("addJobBtn");
const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

function setDashMsg(text, isError = true) {
  dashMsg.style.color = isError ? "#ef4444" : "#10b981";
  dashMsg.innerText = text;
}

function getSelectedStatuses() {
  const checks = document.querySelectorAll(".statusFilter");
  const selected = [];
  checks.forEach(c => {
    if (c.checked) selected.push(c.value);
  });
  return selected;
}

function renderJobs(jobs) {
  jobsGrid.innerHTML = "";

  if (jobs.length === 0) {
    jobsGrid.innerHTML = "<p style='color:#6b7280;'>No applications found.</p>";
    return;
  }

  jobs.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card";

    card.innerHTML = `
      <div class="job-top">
        <div>
          <div class="job-title">${job.role}</div>
          <div class="job-sub">${job.company}</div>
        </div>
        <div class="badge">${job.status}</div>
      </div>

      <div class="job-sub">
        <b>Applied:</b> ${job.applied_date || "-"}<br/>
        <b>Notes:</b> ${job.notes || "-"}
      </div>

      <div class="job-meta">
        <button class="smallbtn" data-id="${job.id}" data-action="delete">Delete</button>
      </div>
    `;

    jobsGrid.appendChild(card);
  });
}

async function fetchJobs() {
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/jobs/my`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      setDashMsg(data.error || "Failed to load jobs");
      return;
    }

    const query = searchInput.value.toLowerCase();
    const selectedStatuses = getSelectedStatuses();

    const filtered = data.filter(job =>
      selectedStatuses.includes(job.status) &&
      (job.company.toLowerCase().includes(query) ||
        job.role.toLowerCase().includes(query))
    );

    renderJobs(filtered);

  } catch (err) {
    setDashMsg("Backend not reachable");
  }
}

addJobBtn.addEventListener("click", async () => {
  const company = document.getElementById("company").value.trim();
  const role = document.getElementById("role").value.trim();
  const status = document.getElementById("status").value;
  const applied_date = document.getElementById("applied_date").value.trim();
  const notes = document.getElementById("notes").value.trim();

  if (!company || !role) {
    setDashMsg("Company and Role are required");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/jobs/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        company,
        role,
        status,
        applied_date,
        notes
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setDashMsg(data.error || "Add failed");
      return;
    }

    setDashMsg("Job added successfully", false);

    document.getElementById("company").value = "";
    document.getElementById("role").value = "";
    document.getElementById("applied_date").value = "";
    document.getElementById("notes").value = "";

    fetchJobs();

  } catch (err) {
    setDashMsg("Backend not reachable");
  }
});

refreshBtn.addEventListener("click", fetchJobs);
searchBtn.addEventListener("click", fetchJobs);
searchInput.addEventListener("input", fetchJobs);

clearFiltersBtn.addEventListener("click", () => {
  document.querySelectorAll(".statusFilter").forEach(c => c.checked = true);
  fetchJobs();
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

/* ✅ DELETE BUTTON WORKING */
jobsGrid.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.getAttribute("data-action");
  const jobId = btn.getAttribute("data-id");

  if (action !== "delete") return;

  const confirmDel = confirm("Delete this application?");
  if (!confirmDel) return;

  try {
    const res = await fetch(`${BASE_URL}/api/jobs/delete/${jobId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      setDashMsg(data.error || "Delete failed");
      return;
    }

    setDashMsg("Deleted successfully", false);
    fetchJobs();

  } catch (err) {
    setDashMsg("Backend not reachable");
  }
});

fetchJobs();
