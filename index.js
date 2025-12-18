let userEmail = "";

// -------------------------------
// Email input binding
// -------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("email-input");
  const emailContainer = document.getElementById("email-container");

  if (emailInput) {
    emailInput.addEventListener("input", function (e) {
      userEmail = e.target.value.trim().toLowerCase();
      emailContainer.innerHTML = userEmail
        ? `Welcome 👋 <b>${userEmail}</b>`
        : "Welcome 👋";
    });
  }
});

// -------------------------------
// Submit movie alert
// -------------------------------
function postAlienEncounter() {
  const movieInput = document.getElementById("city-post-input");
  const movie = movieInput.value.trim();

  if (!movie) {
    Swal.fire("Warning", "Please enter a movie name", "warning");
    return;
  }

  if (!userEmail) {
    Swal.fire("Warning", "Please enter your email", "warning");
    return;
  }

  const isPreferred = JSON.parse(
    document.querySelector('input[name="theatreType"]:checked').value
  );

  $.ajax({
    // ✅ REAL Catalyst URL (FIXED)
    url: "https://movie-alert-60047185658.development.catalystserverless.in/server/movie_alert/datastore",
    type: "POST",
    contentType: "application/json",

    data: JSON.stringify({
      Movie_name: movie,
      Emails: userEmail,
      isPreferredTheatre: isPreferred
    }),

    success: function (data) {
      if (data.status === "exists") {
        Swal.fire("Info", "This email already exists for this movie", "info");
      } else if (data.status === "added") {
        Swal.fire("Success", "Email added for this movie", "success");
        movieInput.value = "";
      } else {
        Swal.fire("Info", data.message || "Done", "info");
      }

      console.log("API Response:", data);
    },

    error: function (err) {
      Swal.fire("Error", "Server not reachable", "error");
      console.error("API Error:", err);
    }
  });
}
