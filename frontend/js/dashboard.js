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

/* ✅ NAVBAR FIX: make links work + set active tab */
(function setupNavbar() {
  const nav = document.querySelector(".navlinks");
  if (!nav) return;

  // Make sure links are correct
  nav.innerHTML = `
    <a href="dashboard.html">My Jobs</a>
    <a href="stats.html">Stats</a>
    <a href="resume.html">Resume</a>
    <a href="about.html">About</a>
  `;

  // Set active based on current page
  const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";
  const links = nav.querySelectorAll("a");

  links.forEach(a => {
    const href = a.getAttribute("href");
    if (href === currentPage) {
      a.classList.add("active");
    }
  });
})();

function setDashMsg(text, isError = true) {
  dashMsg.style.color = isError ? "#ef4444" : "#10b981";
  dashMsg.innerText = text;
}

function getSelectedStatuses() {
  const checks = document.querySelectorAll(".statusFilter");
  const selected = [];
  checks.forEach((c) => {
    if (c.checked) selected.push(c.value);
  });
  return selected;
}

function renderJobs(jobs) {
  jobsGrid.innerHTML = "";

  if (jobs.length === 0) {
    jobsGrid.innerHTML = `<p style="color:#6b7280;">No applications found.</p>`;
    return;
  }

  jobs.forEach((job) => {
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
        <b>Applied:</b> ${job.applied_date || "—"} <br/>
        <b>Notes:</b> ${job.notes || "—"}
      </div>

      <div class="job-meta">
        <button class="smallbtn" data-id="${job.id}" data-action="update">Update</button>
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
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      setDashMsg(data.error || "Failed to load jobs");
      return;
    }

    // Search + filter on frontend
    const query = searchInput.value.trim().toLowerCase();
    const selectedStatuses = getSelectedStatuses();

    const filtered = data.filter(
      (j) =>
        selectedStatuses.includes(j.status) &&
        (j.company.toLowerCase().includes(query) ||
          j.role.toLowerCase().includes(query))
    );

    renderJobs(filtered);
  } catch (err) {
    setDashMsg("Backend not reachable. Is Flask running?");
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
        "Con
