"use strict";

let userEmail = "";

// ⚡ Catalyst serverless function URL
const SERVER_URL = "https://movie-alert-60047185658.development.catalystserverless.in/server/movie_alert/datastore";

/* =========================================================
   🔐 AUTH + INITIAL LOAD
   ========================================================= */
document.addEventListener("DOMContentLoaded", async function () {
  // Get logged-in user email
  catalyst.auth
    .isUserAuthenticated()
    .then((result) => {
      userEmail = result.content.email_id;
      document.getElementById(
        "email-container"
      ).innerHTML = `Welcome 👋 <b>${userEmail}</b>`;
    })
    .catch(() => {
      window.location.href = "/Auth/index.html";
    });

  /* =========================================================
     🎭 LOAD THEATRES
     ========================================================= */
  const theatreList = await (async () => {
    try {
      const res = await fetch("./theatres.json", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length) return json;
      }
    } catch (err) {
      console.warn("Error loading theatres.json:", err);
    }
    return ["Sangam Cinemas 4K RGB Laser Dolby Atmos, Chennai"];
  })();

  const optionsContainer = document.getElementById("theatre-options");
  const template = document.getElementById("theatre-item-template");

  if (optionsContainer && template) {
    theatreList.forEach((name, idx) => {
      const clone = template.content.cloneNode(true);
      const input = clone.querySelector("input.theatre-option");
      const label = clone.querySelector(".theatre-label");

      input.value = name;
      input.id = `theatre_${idx}`;
      label.textContent = name;

      optionsContainer.appendChild(clone);
    });

    optionsContainer
      .querySelectorAll(".theatre-option")
      .forEach((cb) => cb.addEventListener("change", updateDropdownLabel));

    updateDropdownLabel();
  }

  /* =========================================================
     🔘 RADIO CHANGE LISTENER
     ========================================================= */
  document
    .querySelectorAll('input[name="theatreType"]')
    .forEach((radio) => radio.addEventListener("change", toggleMultiselect));

  /* =========================================================
     🔽 DROPDOWN HANDLING
     ========================================================= */
  const dropdownButton = document.getElementById("theatre-dropdown-button");
  const dropdownPanel = document.getElementById("theatre-dropdown-panel");

  dropdownButton.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownPanel.classList.toggle("show");

    // Always scroll to top when dropdown opens
    if (dropdownPanel.classList.contains("show")) {
      const optionsContainer = document.getElementById("theatre-options");
      optionsContainer.scrollTop = 0; // first option will be visible
    }

    document.getElementById("theatre-search")?.focus();
  });

  dropdownPanel.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", () => dropdownPanel.classList.remove("show"));

  /* =========================================================
     🔍 SEARCH FILTER
     ========================================================= */
  document.getElementById("theatre-search").addEventListener("input", function (e) {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll("#theatre-options .list-group-item").forEach((el) => {
      el.style.display = el.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });

  toggleMultiselect();
});

/* =========================================================
   🔘 RADIO → MULTISELECT TOGGLE
   ========================================================= */
window.toggleMultiselect = function () {
  const isPreferred = document.querySelector('input[name="theatreType"]:checked')?.value === "true";
  document.getElementById("theatre-multiselect").style.display = isPreferred ? "block" : "none";
};

/* =========================================================
   🏷️ UPDATE DROPDOWN LABEL
   ========================================================= */
window.updateDropdownLabel = function () {
  const selected = Array.from(document.querySelectorAll(".theatre-option:checked")).map((el) => el.value);
  const button = document.getElementById("theatre-dropdown-button");

  if (selected.length === 0) button.textContent = "Choose theatres";
  else if (selected.length === 1) button.textContent = selected[0];
  else button.textContent = `${selected[0]} +${selected.length - 1}`;
};

/* =========================================================
   ♻️ RESET UI
   ========================================================= */
function resetTheatreSelectionToDefault() {
  document.querySelector('input[name="theatreType"][value="true"]').checked = true;
  toggleMultiselect();

  document.querySelectorAll(".theatre-option").forEach((cb) => (cb.checked = false));
  document.getElementById("theatre-search").value = "";
  document.getElementById("theatre-dropdown-panel").classList.remove("show");
  document.getElementById("theatre-dropdown-button").textContent = "Choose theatres";
}

/* =========================================================
   🔄 AUTO-FETCH EXISTING MOVIE PREFERENCE
   ========================================================= */
document.getElementById("city-post-input").addEventListener("blur", () => {
  const movie = document.getElementById("city-post-input").value.trim();
  if (!movie || !userEmail) return;
  fetchExistingMoviePreference(movie);
});

function fetchExistingMoviePreference(movie) {
  $.ajax({
    url: SERVER_URL,
    type: "GET",
    data: { Movie_name: movie, Emails: userEmail },
    success: function (res) {
      if (res.status === "exists") {
        populatePreviousSelection(res.data);
        Swal.fire("Info", "Previously saved preference loaded", "info");
      }
    },
    error: function () {
      Swal.fire("Error", "Server not reachable", "error");
    },
  });
}

/* =========================================================
   ✅ POPULATE FUNCTION WITH TOP OPTIONS + SCROLL
   ========================================================= */
function populatePreviousSelection(data) {
  // Reset UI first
  resetTheatreSelectionToDefault();

  const radio = document.querySelector(`input[name="theatreType"][value="${data.isPreferredTheatre}"]`);
  if (radio) {
    radio.checked = true;
    toggleMultiselect();
  }

  const optionsContainer = document.getElementById("theatre-options");
  const checkboxes = Array.from(optionsContainer.querySelectorAll(".theatre-option"));

  if (data.isPreferredTheatre && data.preferredTheatres) {
    const saved = data.preferredTheatres.split("|").map((t) => t.toLowerCase().trim());

    const savedOptions = [];
    const otherOptions = [];

    checkboxes.forEach((cb) => {
      if (saved.includes(cb.value.toLowerCase())) {
        cb.checked = true;
        savedOptions.push(cb.closest(".list-group-item"));
      } else {
        cb.checked = false;
        otherOptions.push(cb.closest(".list-group-item"));
      }
    });

    // Reorder: saved at top
    optionsContainer.innerHTML = "";
    savedOptions.forEach((el) => optionsContainer.appendChild(el));
    otherOptions.forEach((el) => optionsContainer.appendChild(el));

    // Scroll to top so first option is visible
    optionsContainer.scrollTop = 0;
  }

  updateDropdownLabel();
}

/* =========================================================
   📤 SUBMIT MOVIE ALERT
   ========================================================= */
function postAlienEncounter() {
  const movie = document.getElementById("city-post-input").value.trim();
  if (!movie) {
    Swal.fire("Warning", "Please enter a movie name", "warning");
    return;
  }

  const isPreferred = JSON.parse(document.querySelector('input[name="theatreType"]:checked').value);
  let selectedTheatres = [];

  if (isPreferred) {
    selectedTheatres = Array.from(document.querySelectorAll(".theatre-option:checked")).map((el) => el.value);
    if (selectedTheatres.length === 0) {
      Swal.fire("Warning", "Please select at least one theatre", "warning");
      return;
    }
  }

  $.ajax({
    url: SERVER_URL,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      Movie_name: movie,
      Emails: userEmail,
      isPreferredTheatre: isPreferred,
      preferredTheatres: isPreferred ? selectedTheatres.join("|") : "",
    }),
    success: function (res) {
      Swal.fire("Success", res.message || "Saved successfully", "success");
      document.getElementById("city-post-input").value = "";
      resetTheatreSelectionToDefault();
    },
    error: function () {
      Swal.fire("Error", "Server not reachable", "error");
    },
  });
}

/* =========================================================
   🚪 LOGOUT
   ========================================================= */
function logout() {
  catalyst.auth.signOut("/Auth/index.html");
}
