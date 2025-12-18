let userEmail = "";

// On page load → get logged-in user email (non-blocking, no redirect)
document.addEventListener("DOMContentLoaded", function () {
  if (typeof catalyst !== "undefined" && catalyst.auth && catalyst.auth.isUserAuthenticated) {
    catalyst.auth
      .isUserAuthenticated()
      .then((result) => {
        userEmail = result.content?.email_id || "";
        const emailContainer = document.getElementById("email-container");
        if (emailContainer && userEmail) emailContainer.innerHTML = `Welcome 👋 <b>${userEmail}</b>`;
      })
      .catch((err) => {
        // Do NOT redirect to /__catalyst/auth/login — keep the page public
        console.warn("isUserAuthenticated failed (running in public mode):", err);
      });
  } else {
    console.warn("Catalyst SDK not available; running in public mode.");
  }
});

// Logout
function logout() {
    // Sign out but avoid redirecting users to the Catalyst login page
    try {
      if (typeof catalyst !== "undefined" && catalyst.auth && catalyst.auth.signOut) {
        catalyst.auth.signOut("/"); // redirect to homepage after signout
      }
    } catch (e) {
      console.error("Sign-out failed:", e);
    }
}

// Submit movie alert
function postAlienEncounter() {
  const movieInput = document.getElementById("city-post-input");
  const movie = movieInput.value.trim();

  if (!movie) {
    Swal.fire("Warning", "Please enter a movie name", "warning");
    return;
  }

  const isPreferred = JSON.parse(
    document.querySelector('input[name="theatreType"]:checked').value
  );

  $.ajax({
    url: "https://movie-alert-60047185658.development.catalystserverless.in/server/movie_alert/datastore",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      Movie_name: movie,
      isPreferredTheatre: isPreferred,
      Emails: userEmail
    }),

    success: function (data) {
      // 🔥 Handle backend responses cleanly
      if (data.status === "exists") {
        Swal.fire("Already Added", "Movie already in alerts", "info");
      } 
      else if (data.status === "email_added") {
        Swal.fire("Updated", "Alert already exists for this movie", "success");
      } 
      else if (data.status === "added") {
        Swal.fire("Success", "Movie added!", "success");
      } 
      else {
        Swal.fire("Info", data.message || "Request processed", "info");
      }

      movieInput.value = ""; // clear input
      console.log("API Response:", data);
    },

    error: function (err) {
      Swal.fire("Error", "Something went wrong. Please try again.", "error");
      console.error("API Error:", err);
    }
  });
}
